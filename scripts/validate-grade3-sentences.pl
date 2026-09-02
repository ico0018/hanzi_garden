#!/usr/bin/env perl
use strict;
use warnings;
use utf8;

# Reproducible curriculum-data verification.
#
# Usage:
#   perl scripts/validate-grade3-sentences.pl
#   perl scripts/validate-grade3-sentences.pl 生字数据.txt
#
# The Grade 3 Upper source must use this optional extension of the established
# data format. Other book files intentionally remain valid without it:
#   生字 | 拼音 | 组词 | 组词拼音 | 释义 ; ... || 关联组词 || 造句

binmode STDOUT, ':encoding(UTF-8)';
binmode STDERR, ':encoding(UTF-8)';

my $data_file = shift @ARGV // '生字数据.txt';
die "Usage: $0 [生字数据.txt]\n" if @ARGV;

sub trim {
  my ($value) = @_;
  $value //= '';
  $value =~ s/^\s+|\s+$//g;
  return $value;
}

sub read_lines {
  my ($file) = @_;
  open my $input, '<:encoding(UTF-8)', $file or die "Cannot read $file: $!\n";
  my @lines = <$input>;
  close $input or die "Cannot close $file: $!\n";
  return @lines;
}

sub data_lines {
  my ($file) = @_;
  my @entries;
  my $line_number = 0;
  for my $line (read_lines($file)) {
    $line_number++;
    next if $line =~ /^\s*(?:#|\[|$)/;
    next unless $line =~ /\|/;
    push @entries, [$line_number, $line];
  }
  return @entries;
}

sub parse_first_group_word {
  my ($word_source, $file, $line_number, $failures) = @_;
  my @groups = grep { length } map { trim($_) } split /;/, $word_source;
  if (!@groups) {
    push @$failures, "$file:$line_number has no group-word entries";
    return '';
  }

  my @parts = map { trim($_) } split /\|/, $groups[0];
  if (@parts < 3 || !length $parts[0] || !length $parts[1] || !length $parts[2]) {
    push @$failures, "$file:$line_number has an invalid first group-word entry";
    return '';
  }
  return $parts[0];
}

my @failures;
my @grade3_entries = data_lines($data_file);
my $sentence_count = 0;

for my $entry (@grade3_entries) {
  my ($line_number, $line) = @$entry;
  my @sections = split /\|\|/, $line, -1;
  if (@sections != 3) {
    push @failures, "$data_file:$line_number must contain exactly two || delimiters";
    next;
  }

  my ($word_source, $linked_word, $sentence) = map { trim($_) } @sections;
  my @base_cells = map { trim($_) } split /\|/, $word_source;
  if (@base_cells < 5 || !length $base_cells[0] || !length $base_cells[1]) {
    push @failures, "$data_file:$line_number is not parseable by the base character-data format";
    next;
  }
  my $first_word = parse_first_group_word(join('|', @base_cells[2 .. $#base_cells]), $data_file, $line_number, \@failures);
  next unless length $first_word;

  if (!length $linked_word) {
    push @failures, "$data_file:$line_number is missing its linked group word";
  } elsif ($linked_word ne $first_word) {
    push @failures, "$data_file:$line_number links '$linked_word' but its first group word is '$first_word'";
  }

  if (!length $sentence) {
    push @failures, "$data_file:$line_number is missing a sentence";
  } elsif (index($sentence, $linked_word) < 0) {
    push @failures, "$data_file:$line_number sentence does not contain '$linked_word'";
  } elsif ($sentence !~ /[。！？!?]\z/) {
    push @failures, "$data_file:$line_number sentence must end in sentence punctuation";
  } else {
    $sentence_count++;
  }
}

if (@grade3_entries != 250) {
  push @failures, "$data_file has " . scalar(@grade3_entries) . " character entries; expected 250";
}

# The parser accepts the pre-existing five-field word entries without `||`.
# Check every other populated textbook source remains in that legacy form.
my @legacy_files = (
  '生字数据_一年级上册.txt',
  '生字数据_二年级上册.txt',
  '生字数据_四年级上册.txt'
);
my $legacy_file_count = 0;
my $legacy_entry_count = 0;
for my $legacy_file (@legacy_files) {
  my @entries = data_lines($legacy_file);
  next unless @entries;
  $legacy_file_count++;
  for my $entry (@entries) {
    my ($line_number, $line) = @$entry;
    if ($line =~ /\|\|/) {
      push @failures, "$legacy_file:$line_number unexpectedly contains sentence metadata";
      next;
    }
    my @cells = map { trim($_) } split /\|/, $line;
    if (@cells < 5 || !length $cells[0] || !length $cells[1]) {
      push @failures, "$legacy_file:$line_number is not parseable by the legacy data format";
      next;
    }
    parse_first_group_word(join('|', @cells[2 .. $#cells]), $legacy_file, $line_number, \@failures);
    $legacy_entry_count++;
  }
}

if (@failures) {
  print STDERR "FAIL: Grade 3 sentence-data validation found " . scalar(@failures) . " issue(s):\n";
  print STDERR "  - $_\n" for @failures;
  exit 1;
}

print "PASS: $sentence_count / " . scalar(@grade3_entries) . " Grade 3 Upper characters have a linked sentence; ";
print "$legacy_entry_count legacy entries across $legacy_file_count populated textbook files remain parseable.\n";

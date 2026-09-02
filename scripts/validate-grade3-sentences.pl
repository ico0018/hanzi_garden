#!/usr/bin/env perl
use strict;
use warnings;
use utf8;

# Reproducible curriculum-data verification.
#
# Usage:
#   perl scripts/validate-grade3-sentences.pl
#   perl scripts/validate-grade3-sentences.pl 生字数据.txt
#   perl scripts/validate-grade3-sentences.pl --self-test
#
# The Grade 3 Upper source must use this optional extension of the established
# data format. Other book files intentionally remain valid without it:
#   生字 | 拼音 | 组词 | 组词拼音 | 释义 ; ... || 关联组词 || 造句

binmode STDOUT, ':encoding(UTF-8)';
binmode STDERR, ':encoding(UTF-8)';

my $self_test = @ARGV && $ARGV[0] eq '--self-test';
shift @ARGV if $self_test;
my $data_file = shift @ARGV // '生字数据.txt';
die "Usage: $0 [生字数据.txt]\n" if @ARGV;

sub trim {
  my ($value) = @_;
  $value //= '';
  $value =~ s/^\s+|\s+$//g;
  return $value;
}

sub normalize_sentence {
  my ($sentence) = @_;
  $sentence = trim($sentence);
  # Ignore whitespace and punctuation when checking that sentence bodies are
  # individually authored rather than trivial punctuation variations.
  $sentence =~ s/[\s\p{P}\p{S}]//g;
  return $sentence;
}

sub is_word_list_metadata {
  my ($sentence) = @_;
  return $sentence =~ /(?:这个|该|上述)(?:词语|词|组词)/
    || $sentence =~ /(?:学习|认识|朗读|书写|讲解|记住).{0,12}(?:词语|组词)/;
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

if ($self_test) {
  die "Self-test failed: old metadata template was accepted\n"
    unless is_word_list_metadata('今天，我们学习了“山坡”这个组词。');
  die "Self-test failed: natural contextual sentence was rejected\n"
    if is_word_list_metadata('我们在山坡上放风筝。');
  die "Self-test failed: punctuation-only duplicate was not normalized\n"
    unless normalize_sentence('我们在山坡上放风筝。') eq normalize_sentence('我们在山坡上放风筝！');
  print "PASS: metadata-template and normalized-duplicate guards work.\n";
  exit 0;
}

my @failures;
my @grade3_entries = data_lines($data_file);
my $sentence_count = 0;
my %normalized_sentence_lines;

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
  } elsif (is_word_list_metadata($sentence)) {
    push @failures, "$data_file:$line_number is a word-list or learning metadata statement, not a contextual sentence";
  } else {
    my $normalized = normalize_sentence($sentence);
    if (my $original_line = $normalized_sentence_lines{$normalized}) {
      push @failures, "$data_file:$line_number duplicates the normalized sentence body from line $original_line";
      next;
    }
    $normalized_sentence_lines{$normalized} = $line_number;
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

print "PASS: $sentence_count / " . scalar(@grade3_entries) . " Grade 3 Upper characters have a linked, unique contextual sentence; ";
print "$legacy_entry_count legacy entries across $legacy_file_count populated textbook files remain parseable.\n";

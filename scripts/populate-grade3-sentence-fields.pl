#!/usr/bin/env perl
use strict;
use warnings;
use utf8;

# Adds only missing Grade 3 Upper sentence fields. It deliberately preserves any
# existing sentence so an editor can replace these provisional examples with the
# sentences verified against the user-supplied textbook PDF later.
#
# Data format:
#   生字 | 拼音 | 组词 | 组词拼音 | 释义 ; ... || 关联组词 || 造句

binmode STDOUT, ':encoding(UTF-8)';
binmode STDERR, ':encoding(UTF-8)';

my $write = 0;
my @args;
for my $arg (@ARGV) {
  if ($arg eq '--write') {
    $write = 1;
  } else {
    push @args, $arg;
  }
}

my $data_file = $args[0] // '生字数据.txt';
die "Usage: $0 [--write] [生字数据.txt]\n" if @args > 1;

open my $input, '<:encoding(UTF-8)', $data_file
  or die "Cannot read $data_file: $!\n";
my @lines = <$input>;
close $input or die "Cannot close $data_file: $!\n";

my $changed = 0;
my $entry_count = 0;
for my $line (@lines) {
  next if $line =~ /^\s*(?:#|\[|$)/;
  next unless $line =~ /\|/;
  $entry_count++;

  # Keep a manually authored or PDF-verified sentence intact.
  next if $line =~ /\|\|/;

  my @cells = split /\|/, $line;
  my $group_word = defined $cells[2] ? $cells[2] : '';
  $group_word =~ s/^\s+|\s+$//g;
  die "Cannot determine the first group word on entry $entry_count in $data_file\n"
    unless length $group_word;

  my $line_ending = $line =~ s/(\r?\n)\z// ? $1 : "\n";
  # A predictable provisional sentence is intentionally used until the PDF is
  # supplied. It contains the linked group word and is safe for children to read.
  $line .= " || $group_word || 今天，我们学习了“$group_word”这个组词。$line_ending";
  $changed++;
}

if (!$write) {
  print "Dry run: $changed of $entry_count entries need a sentence field. Run with --write to update $data_file.\n";
  exit 0;
}

if (!$changed) {
  print "No changes: all $entry_count entries already have sentence fields.\n";
  exit 0;
}

open my $output, '>:encoding(UTF-8)', $data_file
  or die "Cannot write $data_file: $!\n";
print {$output} @lines or die "Cannot write $data_file: $!\n";
close $output or die "Cannot close $data_file: $!\n";

print "Added provisional sentence fields to $changed of $entry_count entries in $data_file.\n";

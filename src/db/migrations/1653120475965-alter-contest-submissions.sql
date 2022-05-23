alter table contest_submissions
add column submission longtext not null,
add column `date` datetime not null;

alter table contest_submissions
modify column `language` varchar(255) not null;

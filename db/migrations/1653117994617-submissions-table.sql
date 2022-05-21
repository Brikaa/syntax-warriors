create table contest_submissions (
    `user_id` int not null,
    contest_id int not null,
    `language` varchar(255),
    constraint fk_submissions_user_id foreign key (`user_id`) references users(id) on delete cascade,
    constraint fk_submissions_contest_id foreign key (contest_id) references contests(id) on delete cascade,
    primary key (`user_id`, contest_id)
);

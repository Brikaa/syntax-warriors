create table test_cases (
    id int not null,
    contest_id int not null,
    input varchar(4096) not null,
    `output` varchar(4096) not null,
    primary key (id, contest_id),
    constraint fk_contest_id_test_cases foreign key (contest_id) references contests(id) on delete cascade
)

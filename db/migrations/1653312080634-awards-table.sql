create table awards (
    id int not null,
    `name` varchar(255) unique,
    required_score int not null,
    required_wins int not null,
    author_id int default null,
    primary key (id),
    constraint fk_awards_author_id foreign key (author_id) references users(id)
);

create table teams (
    id int not null,
    name varchar(255) not null,
    score int,
    leader_id int,
    primary key (id),
    constraint fk_teams_leader_id foreign key (leader_id) references users(id)
);

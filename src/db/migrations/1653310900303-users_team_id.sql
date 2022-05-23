alter table users
add column team_id int default null,
add constraint fk_users_team_id foreign key (team_id) references teams(id)

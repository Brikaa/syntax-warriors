alter table contests
add column author_id int default null,
add constraint fk_contests_author foreign key (author_id) references users(id);

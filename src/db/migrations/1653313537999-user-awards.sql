create table user_awards (
    `user_id` int not null,
    award_id int not null,
    primary key (`user_id`, award_id),
    constraint fk_user_awards_user_id foreign key (`user_id`) references users(id),
    constraint fk_user_awards_award_id foreign key (award_id) references awards(id)
);

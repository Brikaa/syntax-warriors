create table contests (
    id int not null,
    `name` varchar(625) not null,
    descrption longtext,
    `start_date` datetime not null,
    end_date datetime not null,
    primary key (id)
)

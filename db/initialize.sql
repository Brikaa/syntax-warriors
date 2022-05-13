drop database if exists syntax_warriors;
create database if not exists syntax_warriors;

use syntax_warriors;

create table users (
    id int not null auto_increment,
    email varchar(255) not null unique,
    username varchar(255) not null unique,
    `password` varchar(625) not null,
    no_wins int,
    score int,
    primary key (id)
);

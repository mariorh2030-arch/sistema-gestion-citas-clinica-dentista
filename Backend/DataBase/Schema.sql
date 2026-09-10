CREATE DATABASE clinicaDentista CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE clinicaDentista;

CREATE TABLE pacientes(
    id int primary key auto_increment,
    nombre varchar(100) NOT NULL,
    apellidos varchar(100) NOT NULL,
    telefono varchar(100) NOT NULL,
    correo varchar(100),
    fechaNacimiento date,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE citas(
    id int primary key auto_increment,
    pacienteId int NOT NULL,
    tratamientoId int NOT NULL,
    fecha date NOT NULL, 
    hora time NOT NULL,
    duracion INT NOT NULL DEFAULT 30,
    estado varchar(20) NOT NULL,
    recordatorio INT NOT NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE tratamientos(
    id int primary key auto_increment,
    nombreTratamiento varchar(100) NOT NULL,
    precio decimal(10,2) NOT NULL,
    descripcion text 
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE pagos(
    id int primary key auto_increment,
    citaId int NOT NULL,
    fecha date NOT NULL,
    monto decimal(10,2) NOT NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE usuarios(
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombreUsuario VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL
);

ALTER TABLE citas ADD CONSTRAINT fk_citas_pacientes FOREIGN KEY (pacienteId) references pacientes(id) ON DELETE RESTRICT;
ALTER TABLE citas ADD CONSTRAINT fk_citas_tratamiento FOREIGN KEY (tratamientoId) references tratamientos(id) ON DELETE RESTRICT;
ALTER TABLE pagos ADD CONSTRAINT fk_pagos_citas FOREIGN KEY(citaId) references citas(id) ON DELETE RESTRICT;



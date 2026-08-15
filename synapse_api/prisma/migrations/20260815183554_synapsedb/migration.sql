-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_documento" (
    "id" UUID NOT NULL,
    "sigla" VARCHAR(10) NOT NULL,
    "nombre_completo" VARCHAR(100) NOT NULL,

    CONSTRAINT "tipos_documento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL,
    "nombres" VARCHAR(100) NOT NULL,
    "apellidos" VARCHAR(100) NOT NULL,
    "tipo_documento_id" UUID NOT NULL,
    "numero_documento" VARCHAR(30) NOT NULL,
    "fecha_nacimiento" DATE,
    "correo_electronico" VARCHAR(150) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "rol_id" UUID NOT NULL,
    "codigo_2fa" VARCHAR(20),
    "expiracion_2fa" TIMESTAMP(3),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "ultimo_login" TIMESTAMP(3),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3),

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sesiones" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "token_sesion" VARCHAR(500) NOT NULL,
    "ip_direccion" VARCHAR(100),
    "navegador_info" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultima_actividad" TIMESTAMP(3),
    "expira_en" TIMESTAMP(3),

    CONSTRAINT "sesiones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokens_actualizacion" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "token" VARCHAR(500) NOT NULL,
    "expira_en" TIMESTAMP(3) NOT NULL,
    "revocado" BOOLEAN NOT NULL DEFAULT false,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tokens_actualizacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokens_recuperacion_password" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "token" VARCHAR(500) NOT NULL,
    "expira_en" TIMESTAMP(3) NOT NULL,
    "usado" BOOLEAN NOT NULL DEFAULT false,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tokens_recuperacion_password_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programas" (
    "id" UUID NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "slug" VARCHAR(180) NOT NULL,
    "sector" VARCHAR(100),
    "estado" VARCHAR(30) NOT NULL DEFAULT 'activo',
    "imagen_url" VARCHAR(500),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3),

    CONSTRAINT "programas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programas_beneficios" (
    "id" UUID NOT NULL,
    "programa_id" UUID NOT NULL,
    "beneficio" TEXT NOT NULL,

    CONSTRAINT "programas_beneficios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programas_requisitos" (
    "id" UUID NOT NULL,
    "programa_id" UUID NOT NULL,
    "requisito" TEXT NOT NULL,

    CONSTRAINT "programas_requisitos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programas_descripciones" (
    "id" UUID NOT NULL,
    "programa_id" UUID NOT NULL,
    "contenido_html" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "programas_descripciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programas_horarios" (
    "id" UUID NOT NULL,
    "programa_id" UUID NOT NULL,
    "modalidad" VARCHAR(50) NOT NULL,
    "jornada" VARCHAR(50) NOT NULL,
    "horarios_json" JSONB,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "programas_horarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coordinadores_programas" (
    "id" UUID NOT NULL,
    "coordinador_id" UUID NOT NULL,
    "programa_id" UUID NOT NULL,
    "asignado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coordinadores_programas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profesores_programas" (
    "id" UUID NOT NULL,
    "profesor_id" UUID NOT NULL,
    "programa_id" UUID NOT NULL,
    "asignado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profesores_programas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grupos" (
    "id" UUID NOT NULL,
    "programa_id" UUID NOT NULL,
    "numero" VARCHAR(100) NOT NULL,
    "nombre" VARCHAR(100),
    "capacidad_maxima" INTEGER NOT NULL DEFAULT 30,
    "capacidad_actual" INTEGER NOT NULL DEFAULT 0,
    "estado" VARCHAR(30) NOT NULL DEFAULT 'activo',
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3),

    CONSTRAINT "grupos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grupos_aprendices" (
    "id" UUID NOT NULL,
    "grupo_id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "fecha_asignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "asignado_por" UUID NOT NULL,

    CONSTRAINT "grupos_aprendices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inscripciones" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "programa_id" UUID NOT NULL,
    "grupo_id" UUID,
    "estado" VARCHAR(30) NOT NULL DEFAULT 'pendiente',
    "observaciones" TEXT,
    "fecha_inscripcion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total_faltas" INTEGER NOT NULL DEFAULT 0,
    "limite_faltas" INTEGER NOT NULL DEFAULT 3,
    "suspendido" BOOLEAN NOT NULL DEFAULT false,
    "fecha_suspension" TIMESTAMP(3),
    "motivo_expulsion" TEXT,
    "expulsado_por" UUID,
    "fecha_expulsion" TIMESTAMP(3),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3),

    CONSTRAINT "inscripciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asistencias" (
    "id" UUID NOT NULL,
    "inscripcion_id" UUID NOT NULL,
    "fecha" DATE NOT NULL,
    "asistio" BOOLEAN NOT NULL DEFAULT false,
    "observacion" TEXT,
    "registrado_por" UUID,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asistencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_asignaciones" (
    "id" UUID NOT NULL,
    "grupo_id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "estado_anterior" VARCHAR(30),
    "estado_nuevo" VARCHAR(30) NOT NULL,
    "razon" VARCHAR(255),
    "coordinador_id" UUID NOT NULL,
    "fecha_cambio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_asignaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calificaciones" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "programa_id" UUID NOT NULL,
    "grupo_id" UUID,
    "profesor_id" UUID NOT NULL,
    "calificacion" DECIMAL(5,2) NOT NULL,
    "observacion" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3),

    CONSTRAINT "calificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chatbot_historial" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "pregunta_usuario" TEXT NOT NULL,
    "respuesta_bot" TEXT NOT NULL,
    "programa_consultado_id" UUID,
    "tokens_consumidos" INTEGER,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chatbot_historial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos_rag" (
    "id" UUID NOT NULL,
    "titulo" VARCHAR(255) NOT NULL,
    "tipo" VARCHAR(100) NOT NULL,
    "contenido" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documentos_rag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditorias" (
    "id" UUID NOT NULL,
    "usuario_id" UUID,
    "accion" VARCHAR(100) NOT NULL,
    "tabla" VARCHAR(100) NOT NULL,
    "registro_id" TEXT,
    "datos_anteriores" JSONB,
    "datos_nuevos" JSONB,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditorias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_key" ON "roles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_documento_sigla_key" ON "tipos_documento"("sigla");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_numero_documento_key" ON "usuarios"("numero_documento");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_correo_electronico_key" ON "usuarios"("correo_electronico");

-- CreateIndex
CREATE INDEX "usuarios_tipo_documento_id_idx" ON "usuarios"("tipo_documento_id");

-- CreateIndex
CREATE INDEX "usuarios_rol_id_idx" ON "usuarios"("rol_id");

-- CreateIndex
CREATE UNIQUE INDEX "sesiones_token_sesion_key" ON "sesiones"("token_sesion");

-- CreateIndex
CREATE INDEX "sesiones_usuario_id_idx" ON "sesiones"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "tokens_actualizacion_token_key" ON "tokens_actualizacion"("token");

-- CreateIndex
CREATE INDEX "tokens_actualizacion_usuario_id_idx" ON "tokens_actualizacion"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "tokens_recuperacion_password_token_key" ON "tokens_recuperacion_password"("token");

-- CreateIndex
CREATE INDEX "tokens_recuperacion_password_usuario_id_idx" ON "tokens_recuperacion_password"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "programas_slug_key" ON "programas"("slug");

-- CreateIndex
CREATE INDEX "programas_beneficios_programa_id_idx" ON "programas_beneficios"("programa_id");

-- CreateIndex
CREATE INDEX "programas_requisitos_programa_id_idx" ON "programas_requisitos"("programa_id");

-- CreateIndex
CREATE UNIQUE INDEX "programas_descripciones_programa_id_key" ON "programas_descripciones"("programa_id");

-- CreateIndex
CREATE INDEX "programas_horarios_programa_id_idx" ON "programas_horarios"("programa_id");

-- CreateIndex
CREATE INDEX "coordinadores_programas_coordinador_id_idx" ON "coordinadores_programas"("coordinador_id");

-- CreateIndex
CREATE INDEX "coordinadores_programas_programa_id_idx" ON "coordinadores_programas"("programa_id");

-- CreateIndex
CREATE UNIQUE INDEX "coordinadores_programas_coordinador_id_programa_id_key" ON "coordinadores_programas"("coordinador_id", "programa_id");

-- CreateIndex
CREATE INDEX "profesores_programas_profesor_id_idx" ON "profesores_programas"("profesor_id");

-- CreateIndex
CREATE INDEX "profesores_programas_programa_id_idx" ON "profesores_programas"("programa_id");

-- CreateIndex
CREATE UNIQUE INDEX "profesores_programas_profesor_id_programa_id_key" ON "profesores_programas"("profesor_id", "programa_id");

-- CreateIndex
CREATE INDEX "grupos_programa_id_idx" ON "grupos"("programa_id");

-- CreateIndex
CREATE INDEX "grupos_estado_idx" ON "grupos"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "grupos_programa_id_numero_key" ON "grupos"("programa_id", "numero");

-- CreateIndex
CREATE INDEX "grupos_aprendices_grupo_id_idx" ON "grupos_aprendices"("grupo_id");

-- CreateIndex
CREATE INDEX "grupos_aprendices_usuario_id_idx" ON "grupos_aprendices"("usuario_id");

-- CreateIndex
CREATE INDEX "grupos_aprendices_asignado_por_idx" ON "grupos_aprendices"("asignado_por");

-- CreateIndex
CREATE UNIQUE INDEX "grupos_aprendices_grupo_id_usuario_id_key" ON "grupos_aprendices"("grupo_id", "usuario_id");

-- CreateIndex
CREATE INDEX "inscripciones_usuario_id_idx" ON "inscripciones"("usuario_id");

-- CreateIndex
CREATE INDEX "inscripciones_programa_id_idx" ON "inscripciones"("programa_id");

-- CreateIndex
CREATE INDEX "inscripciones_grupo_id_idx" ON "inscripciones"("grupo_id");

-- CreateIndex
CREATE INDEX "inscripciones_expulsado_por_idx" ON "inscripciones"("expulsado_por");

-- CreateIndex
CREATE UNIQUE INDEX "inscripciones_usuario_id_programa_id_key" ON "inscripciones"("usuario_id", "programa_id");

-- CreateIndex
CREATE INDEX "asistencias_inscripcion_id_idx" ON "asistencias"("inscripcion_id");

-- CreateIndex
CREATE INDEX "asistencias_registrado_por_idx" ON "asistencias"("registrado_por");

-- CreateIndex
CREATE UNIQUE INDEX "asistencias_inscripcion_id_fecha_key" ON "asistencias"("inscripcion_id", "fecha");

-- CreateIndex
CREATE INDEX "historial_asignaciones_grupo_id_idx" ON "historial_asignaciones"("grupo_id");

-- CreateIndex
CREATE INDEX "historial_asignaciones_usuario_id_idx" ON "historial_asignaciones"("usuario_id");

-- CreateIndex
CREATE INDEX "historial_asignaciones_coordinador_id_idx" ON "historial_asignaciones"("coordinador_id");

-- CreateIndex
CREATE INDEX "calificaciones_usuario_id_idx" ON "calificaciones"("usuario_id");

-- CreateIndex
CREATE INDEX "calificaciones_programa_id_idx" ON "calificaciones"("programa_id");

-- CreateIndex
CREATE INDEX "calificaciones_grupo_id_idx" ON "calificaciones"("grupo_id");

-- CreateIndex
CREATE INDEX "calificaciones_profesor_id_idx" ON "calificaciones"("profesor_id");

-- CreateIndex
CREATE INDEX "chatbot_historial_usuario_id_idx" ON "chatbot_historial"("usuario_id");

-- CreateIndex
CREATE INDEX "chatbot_historial_programa_consultado_id_idx" ON "chatbot_historial"("programa_consultado_id");

-- CreateIndex
CREATE INDEX "auditorias_usuario_id_idx" ON "auditorias"("usuario_id");

-- CreateIndex
CREATE INDEX "auditorias_tabla_idx" ON "auditorias"("tabla");

-- CreateIndex
CREATE INDEX "auditorias_registro_id_idx" ON "auditorias"("registro_id");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_tipo_documento_id_fkey" FOREIGN KEY ("tipo_documento_id") REFERENCES "tipos_documento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesiones" ADD CONSTRAINT "sesiones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokens_actualizacion" ADD CONSTRAINT "tokens_actualizacion_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokens_recuperacion_password" ADD CONSTRAINT "tokens_recuperacion_password_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programas_beneficios" ADD CONSTRAINT "programas_beneficios_programa_id_fkey" FOREIGN KEY ("programa_id") REFERENCES "programas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programas_requisitos" ADD CONSTRAINT "programas_requisitos_programa_id_fkey" FOREIGN KEY ("programa_id") REFERENCES "programas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programas_descripciones" ADD CONSTRAINT "programas_descripciones_programa_id_fkey" FOREIGN KEY ("programa_id") REFERENCES "programas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programas_horarios" ADD CONSTRAINT "programas_horarios_programa_id_fkey" FOREIGN KEY ("programa_id") REFERENCES "programas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coordinadores_programas" ADD CONSTRAINT "coordinadores_programas_coordinador_id_fkey" FOREIGN KEY ("coordinador_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coordinadores_programas" ADD CONSTRAINT "coordinadores_programas_programa_id_fkey" FOREIGN KEY ("programa_id") REFERENCES "programas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profesores_programas" ADD CONSTRAINT "profesores_programas_profesor_id_fkey" FOREIGN KEY ("profesor_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profesores_programas" ADD CONSTRAINT "profesores_programas_programa_id_fkey" FOREIGN KEY ("programa_id") REFERENCES "programas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupos" ADD CONSTRAINT "grupos_programa_id_fkey" FOREIGN KEY ("programa_id") REFERENCES "programas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupos_aprendices" ADD CONSTRAINT "grupos_aprendices_grupo_id_fkey" FOREIGN KEY ("grupo_id") REFERENCES "grupos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupos_aprendices" ADD CONSTRAINT "grupos_aprendices_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupos_aprendices" ADD CONSTRAINT "grupos_aprendices_asignado_por_fkey" FOREIGN KEY ("asignado_por") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones" ADD CONSTRAINT "inscripciones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones" ADD CONSTRAINT "inscripciones_programa_id_fkey" FOREIGN KEY ("programa_id") REFERENCES "programas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones" ADD CONSTRAINT "inscripciones_grupo_id_fkey" FOREIGN KEY ("grupo_id") REFERENCES "grupos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones" ADD CONSTRAINT "inscripciones_expulsado_por_fkey" FOREIGN KEY ("expulsado_por") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencias" ADD CONSTRAINT "asistencias_inscripcion_id_fkey" FOREIGN KEY ("inscripcion_id") REFERENCES "inscripciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencias" ADD CONSTRAINT "asistencias_registrado_por_fkey" FOREIGN KEY ("registrado_por") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_asignaciones" ADD CONSTRAINT "historial_asignaciones_grupo_id_fkey" FOREIGN KEY ("grupo_id") REFERENCES "grupos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_asignaciones" ADD CONSTRAINT "historial_asignaciones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_asignaciones" ADD CONSTRAINT "historial_asignaciones_coordinador_id_fkey" FOREIGN KEY ("coordinador_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calificaciones" ADD CONSTRAINT "calificaciones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calificaciones" ADD CONSTRAINT "calificaciones_programa_id_fkey" FOREIGN KEY ("programa_id") REFERENCES "programas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calificaciones" ADD CONSTRAINT "calificaciones_grupo_id_fkey" FOREIGN KEY ("grupo_id") REFERENCES "grupos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calificaciones" ADD CONSTRAINT "calificaciones_profesor_id_fkey" FOREIGN KEY ("profesor_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chatbot_historial" ADD CONSTRAINT "chatbot_historial_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chatbot_historial" ADD CONSTRAINT "chatbot_historial_programa_consultado_id_fkey" FOREIGN KEY ("programa_consultado_id") REFERENCES "programas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditorias" ADD CONSTRAINT "auditorias_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

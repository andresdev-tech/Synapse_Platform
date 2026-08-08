-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_documento" (
    "id" SERIAL NOT NULL,
    "sigla" TEXT NOT NULL,
    "nombre_completo" TEXT NOT NULL,

    CONSTRAINT "tipos_documento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "tipo_documento_id" INTEGER NOT NULL,
    "numero_documento" TEXT NOT NULL,
    "fecha_nacimiento" TIMESTAMP(3),
    "correo_electronico" TEXT NOT NULL,
    "contrasena_hash" TEXT NOT NULL,
    "rol_id" INTEGER NOT NULL,
    "codigo_2fa" TEXT,
    "expiracion_2fa" TIMESTAMP(3),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "ultimo_login" TIMESTAMP(3),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sesiones" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "token_sesion" TEXT NOT NULL,
    "ip_direccion" TEXT,
    "navegador_info" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultima_actividad" TIMESTAMP(3),
    "expira_en" TIMESTAMP(3),

    CONSTRAINT "sesiones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokens_actualizacion" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "expira_en" TIMESTAMP(3) NOT NULL,
    "revocado" BOOLEAN NOT NULL DEFAULT false,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tokens_actualizacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokens_recuperacion_contrasena" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "expira_en" TIMESTAMP(3) NOT NULL,
    "usado" BOOLEAN NOT NULL DEFAULT false,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tokens_recuperacion_contrasena_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programas" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sector" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'activo',
    "imagen_url" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "programas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programas_beneficios" (
    "id" SERIAL NOT NULL,
    "programa_id" INTEGER NOT NULL,
    "beneficio" TEXT NOT NULL,

    CONSTRAINT "programas_beneficios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programas_requisitos" (
    "id" SERIAL NOT NULL,
    "programa_id" INTEGER NOT NULL,
    "requisito" TEXT NOT NULL,

    CONSTRAINT "programas_requisitos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programas_descripciones" (
    "id" SERIAL NOT NULL,
    "programa_id" INTEGER NOT NULL,
    "contenido_html" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "programas_descripciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programas_horarios" (
    "id" SERIAL NOT NULL,
    "programa_id" INTEGER NOT NULL,
    "modalidad" TEXT NOT NULL,
    "jornada" TEXT NOT NULL,
    "horarios_json" JSONB,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "programas_horarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inscripciones" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "programa_id" INTEGER NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "observaciones" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inscripciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grupos" (
    "id" SERIAL NOT NULL,
    "programa_id" INTEGER NOT NULL,
    "numero" TEXT NOT NULL,
    "capacidad_maxima" INTEGER NOT NULL DEFAULT 30,
    "capacidad_actual" INTEGER NOT NULL DEFAULT 0,
    "estado" TEXT NOT NULL DEFAULT 'activo',
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grupos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grupos_aprendices" (
    "id" SERIAL NOT NULL,
    "grupo_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "fecha_asignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "grupos_aprendices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profesores_programas" (
    "id" SERIAL NOT NULL,
    "profesor_id" INTEGER NOT NULL,
    "programa_id" INTEGER NOT NULL,

    CONSTRAINT "profesores_programas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_asignaciones" (
    "id" SERIAL NOT NULL,
    "grupo_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "estado_anterior" TEXT,
    "estado_nuevo" TEXT NOT NULL,
    "razon" TEXT,
    "coordinador_id" INTEGER NOT NULL,
    "fecha_cambio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_asignaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asistencias" (
    "id" SERIAL NOT NULL,
    "inscripcion_id" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "asistio" BOOLEAN NOT NULL DEFAULT false,
    "observacion" TEXT,
    "registrado_por" INTEGER,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asistencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chatbot_historial" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "pregunta_usuario" TEXT NOT NULL,
    "respuesta_bot" TEXT NOT NULL,
    "programa_consultado_id" INTEGER,
    "tokens_consumidos" INTEGER,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chatbot_historial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos_rag" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "contenido" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documentos_rag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditorias" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER,
    "accion" TEXT NOT NULL,
    "tabla" TEXT NOT NULL,
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
CREATE UNIQUE INDEX "tokens_recuperacion_contrasena_token_key" ON "tokens_recuperacion_contrasena"("token");

-- CreateIndex
CREATE INDEX "tokens_recuperacion_contrasena_usuario_id_idx" ON "tokens_recuperacion_contrasena"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "programas_slug_key" ON "programas"("slug");

-- CreateIndex
CREATE INDEX "programas_beneficios_programa_id_idx" ON "programas_beneficios"("programa_id");

-- CreateIndex
CREATE INDEX "programas_requisitos_programa_id_idx" ON "programas_requisitos"("programa_id");

-- CreateIndex
CREATE INDEX "programas_descripciones_programa_id_idx" ON "programas_descripciones"("programa_id");

-- CreateIndex
CREATE INDEX "programas_horarios_programa_id_idx" ON "programas_horarios"("programa_id");

-- CreateIndex
CREATE INDEX "inscripciones_usuario_id_idx" ON "inscripciones"("usuario_id");

-- CreateIndex
CREATE INDEX "inscripciones_programa_id_idx" ON "inscripciones"("programa_id");

-- CreateIndex
CREATE UNIQUE INDEX "inscripciones_usuario_id_programa_id_key" ON "inscripciones"("usuario_id", "programa_id");

-- CreateIndex
CREATE INDEX "grupos_programa_id_idx" ON "grupos"("programa_id");

-- CreateIndex
CREATE UNIQUE INDEX "grupos_programa_id_numero_key" ON "grupos"("programa_id", "numero");

-- CreateIndex
CREATE INDEX "grupos_aprendices_grupo_id_idx" ON "grupos_aprendices"("grupo_id");

-- CreateIndex
CREATE INDEX "grupos_aprendices_usuario_id_idx" ON "grupos_aprendices"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "grupos_aprendices_grupo_id_usuario_id_key" ON "grupos_aprendices"("grupo_id", "usuario_id");

-- CreateIndex
CREATE INDEX "profesores_programas_profesor_id_idx" ON "profesores_programas"("profesor_id");

-- CreateIndex
CREATE INDEX "profesores_programas_programa_id_idx" ON "profesores_programas"("programa_id");

-- CreateIndex
CREATE UNIQUE INDEX "profesores_programas_profesor_id_programa_id_key" ON "profesores_programas"("profesor_id", "programa_id");

-- CreateIndex
CREATE INDEX "historial_asignaciones_grupo_id_idx" ON "historial_asignaciones"("grupo_id");

-- CreateIndex
CREATE INDEX "historial_asignaciones_usuario_id_idx" ON "historial_asignaciones"("usuario_id");

-- CreateIndex
CREATE INDEX "historial_asignaciones_coordinador_id_idx" ON "historial_asignaciones"("coordinador_id");

-- CreateIndex
CREATE INDEX "asistencias_inscripcion_id_idx" ON "asistencias"("inscripcion_id");

-- CreateIndex
CREATE INDEX "asistencias_registrado_por_idx" ON "asistencias"("registrado_por");

-- CreateIndex
CREATE UNIQUE INDEX "asistencias_inscripcion_id_fecha_key" ON "asistencias"("inscripcion_id", "fecha");

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
ALTER TABLE "tokens_recuperacion_contrasena" ADD CONSTRAINT "tokens_recuperacion_contrasena_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programas_beneficios" ADD CONSTRAINT "programas_beneficios_programa_id_fkey" FOREIGN KEY ("programa_id") REFERENCES "programas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programas_requisitos" ADD CONSTRAINT "programas_requisitos_programa_id_fkey" FOREIGN KEY ("programa_id") REFERENCES "programas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programas_descripciones" ADD CONSTRAINT "programas_descripciones_programa_id_fkey" FOREIGN KEY ("programa_id") REFERENCES "programas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programas_horarios" ADD CONSTRAINT "programas_horarios_programa_id_fkey" FOREIGN KEY ("programa_id") REFERENCES "programas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones" ADD CONSTRAINT "inscripciones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscripciones" ADD CONSTRAINT "inscripciones_programa_id_fkey" FOREIGN KEY ("programa_id") REFERENCES "programas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupos" ADD CONSTRAINT "grupos_programa_id_fkey" FOREIGN KEY ("programa_id") REFERENCES "programas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupos_aprendices" ADD CONSTRAINT "grupos_aprendices_grupo_id_fkey" FOREIGN KEY ("grupo_id") REFERENCES "grupos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupos_aprendices" ADD CONSTRAINT "grupos_aprendices_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profesores_programas" ADD CONSTRAINT "profesores_programas_profesor_id_fkey" FOREIGN KEY ("profesor_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profesores_programas" ADD CONSTRAINT "profesores_programas_programa_id_fkey" FOREIGN KEY ("programa_id") REFERENCES "programas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_asignaciones" ADD CONSTRAINT "historial_asignaciones_grupo_id_fkey" FOREIGN KEY ("grupo_id") REFERENCES "grupos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_asignaciones" ADD CONSTRAINT "historial_asignaciones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_asignaciones" ADD CONSTRAINT "historial_asignaciones_coordinador_id_fkey" FOREIGN KEY ("coordinador_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencias" ADD CONSTRAINT "asistencias_inscripcion_id_fkey" FOREIGN KEY ("inscripcion_id") REFERENCES "inscripciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asistencias" ADD CONSTRAINT "asistencias_registrado_por_fkey" FOREIGN KEY ("registrado_por") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chatbot_historial" ADD CONSTRAINT "chatbot_historial_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chatbot_historial" ADD CONSTRAINT "chatbot_historial_programa_consultado_id_fkey" FOREIGN KEY ("programa_consultado_id") REFERENCES "programas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditorias" ADD CONSTRAINT "auditorias_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

# 🤝 Guía de Contribución - MediLink Frontend

¡Gracias por tu interés en contribuir a MediLink! Este documento proporciona las directrices y mejores prácticas para colaborar en el proyecto.

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [¿Cómo puedo contribuir?](#cómo-puedo-contribuir)
- [Configuración del Entorno de Desarrollo](#configuración-del-entorno-de-desarrollo)
- [Flujo de Trabajo con Git](#flujo-de-trabajo-con-git)
- [Estándares de Código](#estándares-de-código)
- [Convenciones de Commits](#convenciones-de-commits)
- [Proceso de Pull Request](#proceso-de-pull-request)
- [Reportar Bugs](#reportar-bugs)

## 📜 Código de Conducta

Este proyecto se adhiere a un código de conducta profesional. Al participar, se espera que mantengas un ambiente respetuoso y colaborativo.

## 🚀 ¿Cómo puedo contribuir?

Hay varias formas de contribuir al proyecto:

- 🐛 **Reportar bugs**: Identifica y documenta errores
- ✨ **Proponer nuevas funcionalidades**: Sugiere mejoras
- 📝 **Mejorar documentación**: Ayuda a que el proyecto sea más accesible
- 🔧 **Corregir bugs**: Envía fixes para problemas existentes
- 💄 **Mejorar UI/UX**: Propón mejoras visuales o de experiencia de usuario
- 🌍 **Traducciones**: Mejora o añade nuevos idiomas

## 🛠 Configuración del Entorno de Desarrollo

### Requisitos Previos

- **Node.js**: v18 o superior
- **npm**: v9 o superior
- **Git**: Última versión estable

### Instalación

1. **Fork el repositorio** en GitHub

2. **Clona tu fork localmente**:
   ```bash
   git clone https://github.com/TU_USUARIO/medilink-frontend.git
   cd medilink-frontend
   ```

3. **Agrega el repositorio original como upstream**:
   ```bash
   git remote add upstream https://github.com/echeverriadev/medilink-frontend.git
   ```

4. **Instala las dependencias**:
   ```bash
   npm install
   ```

5. **Configura las variables de entorno**:
   ```bash
   cp .env.example .env
   # Edita .env con tus credenciales de Firebase
   ```

6. **Inicia el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

El proyecto estará disponible en `http://localhost:5173`

## 🔄 Flujo de Trabajo con Git

### 1. Crea una rama para tu feature/fix

```bash
git checkout -b feature/nombre-descriptivo
# o
git checkout -b fix/descripcion-del-bug
```

### 2. Realiza tus cambios

Asegúrate de seguir los [estándares de código](#estándares-de-código).

### 3. Mantén tu rama actualizada

```bash
git fetch upstream
git rebase upstream/main
```

### 4. Commit de tus cambios

Sigue las [convenciones de commits](#convenciones-de-commits):

```bash
git add .
git commit -m "feat: descripción clara del cambio"
```

### 5. Push a tu fork

```bash
git push origin feature/nombre-descriptivo
```

### 6. Abre un Pull Request

Ve a GitHub y crea un PR desde tu rama hacia `main` del repositorio original.

## 📐 Estándares de Código

### TypeScript

- Usa **TypeScript** para todo el código nuevo
- Define tipos explícitos, evita `any`
- Usa interfaces para objetos complejos

### React

- Usa **componentes funcionales** con hooks
- Mantén componentes pequeños y reutilizables
- Extrae lógica compleja a custom hooks

### Estilos

- Usa **Tailwind CSS** para estilos
- Aplica clases `dark:` para soporte de modo oscuro
- Mantén consistencia con el sistema de diseño existente

### Internacionalización (i18n)

- **NO** hardcodees texto en español o inglés
- Usa `t('namespace.key')` para todos los textos visibles
- Agrega traducciones en `src/locales/en.json` y `src/locales/es.json`

### Estructura de Archivos

```
src/
├── modules/
│   ├── auth/           # Autenticación
│   ├── dashboard/      # Dashboard y módulos principales
│   └── shared/         # Componentes compartidos
├── config/             # Configuraciones (Firebase, etc.)
└── locales/            # Archivos de traducción
```

### Linting y Formato

Antes de hacer commit, ejecuta:

```bash
npm run lint          # Verifica errores de ESLint
npm run build         # Asegura que el proyecto compila
```

## 📝 Convenciones de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>(<scope>): <descripción>

[cuerpo opcional]

[footer opcional]
```

### Tipos de Commit

- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Formato, punto y coma faltantes, etc. (no afecta el código)
- `refactor`: Refactorización de código
- `perf`: Mejoras de rendimiento
- `test`: Agregar o corregir tests
- `chore`: Cambios en build, dependencias, etc.
- `i18n`: Traducciones o cambios de internacionalización
- `security`: Correcciones de seguridad

### Ejemplos

```bash
feat(patients): add patient search functionality
fix(appointments): resolve calendar date picker bug
docs: update README with Docker instructions
i18n: add missing Spanish translations for dashboard
security: move Firebase config to environment variables
```

## 🔍 Proceso de Pull Request

### Antes de Enviar

- [ ] El código sigue los estándares del proyecto
- [ ] Has probado tus cambios localmente
- [ ] Has probado en modo claro y oscuro
- [ ] Has probado en español e inglés
- [ ] `npm run build` ejecuta sin errores
- [ ] Has actualizado la documentación si es necesario
- [ ] No has expuesto credenciales o información sensible

### Durante la Revisión

- Responde a los comentarios de manera constructiva
- Realiza los cambios solicitados en commits adicionales
- Mantén la conversación profesional y enfocada

### Después de la Aprobación

Tu PR será mergeado por un maintainer. ¡Gracias por tu contribución! 🎉

## 🐛 Reportar Bugs

### Antes de Reportar

1. Verifica que el bug no haya sido reportado previamente
2. Asegúrate de estar usando la última versión
3. Reproduce el bug de manera consistente

### Información a Incluir

- **Descripción clara** del problema
- **Pasos para reproducir** el bug
- **Comportamiento esperado** vs **comportamiento actual**
- **Capturas de pantalla** (si aplica)
- **Entorno**:
  - Navegador y versión
  - Sistema operativo
  - Versión de Node.js

## 🔒 Seguridad

Si descubres una vulnerabilidad de seguridad, **NO** abras un issue público. Contacta directamente al equipo de desarrollo.

## 📞 ¿Necesitas Ayuda?

- Abre un **Discussion** en GitHub para preguntas generales
- Revisa la documentación en el `README.md`
- Consulta issues cerrados para problemas similares

---

**¡Gracias por contribuir a MediLink!** 💙

Tu tiempo y esfuerzo ayudan a mejorar la gestión médica para todos.

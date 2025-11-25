# Setup del Proyecto - Paso a Paso

## Qué estamos haciendo y por qué

### 1. `npm init`
Inicializa un nuevo proyecto Node.js y crea el `package.json`. Es el primer paso para cualquier proyecto de Node.

### 2. `npm i -D typescript ts-node vitest @types/node`
Instalamos las herramientas de desarrollo:
- **typescript**: compilador de TypeScript (convertir .ts a .js)
- **ts-node**: ejecutor de TypeScript directo (para development)
- **vitest**: framework de testing (para escribir y correr tests)
- **@types/node**: tipos de TypeScript para Node.js (para que TypeScript sepa qué son fs, http, etc.)
- El flag `-D` indica que son dependencias de **desarrollo** (no van a producción)

### 3. `npm i fastify`
Instalamos fastify como dependencia de **producción**. Es el framework web que vamos a usar para crear el servidor.

### 4. Actualizar `package.json`
Añadimos y configuramos:
- **`"type": "module"`**: le decimos a Node.js que usemos ES modules (import/export en lugar de require)
- **`"main": "dist/index.js"`**: apunta al archivo compilado (no el TypeScript original)
- **Scripts configurados**:
  - `dev`: ejecuta con tsx (antes era `tsx watch`, ahora ejecuta una sola vez)
  - `build`: compila TypeScript a JavaScript con `tsc -p tsconfig.json`
  - `start`: ejecuta el código compilado en producción
  - `test`: corre los tests con `vitest run`

### 5. Crear `tsconfig.json`
Configuramos cómo TypeScript compila el código:
- **`target: ES2020`** - Versión moderna de JavaScript
- **`module: NodeNext`** - Soporte para módulos ES en Node.js moderno
- **`outDir: dist`** - El código compilado va a `dist/`
- **`rootDir: .`** - La raíz del proyecto es el punto de referencia
- **`baseUrl: .`** - Punto de partida para los path aliases
- **`paths: "@/*": ["./*"]`** - Alias `@/*` para imports limpios
- **`strict: true`** - Máxima seguridad de tipos (detecta más errores)
- **`moduleResolution: NodeNext`** - Resolución de módulos específica para Node.js
- **`declaration: true`** - Genera archivos `.d.ts`
- **`sourceMap: true`** - Mapeo de fuentes para debugging
- **`include: ["src/**/*.ts", "main.ts"]`** - Archivos a compilar
- **`exclude: ["node_modules", "dist", "tests"]`** - Archivos a excluir

**Nota:** Podrías generar este archivo con `npx tsc --init`, pero nosotros lo configuramos manualmente para más control.

### 6. `npm i -D tsx`
Instalamos **tsx**, que es:
- Un ejecutor moderno de TypeScript más rápido que `ts-node`
- Permite correr archivos `.ts` directamente sin compilar previamente
- Lo usamos en el script `dev` para ejecutar la aplicación en desarrollo
- Mejor rendimiento y soporte más moderno que `ts-node`

### 7. Crear `README.md`
Documentación formal del proyecto con:
- Resumen de la configuración
- Explicación de cada herramienta
- Dependencias y por qué se usan
- Estructura del proyecto
- Comandos disponibles
- Próximos pasos

### 8. Crear `SETUP.md`
Este archivo que documenta todos los pasos y decisiones tomadas de forma más informal y comprensible.

### 9. Crear `.gitignore`
Archivo para excluir archivos y carpetas que **no queremos versionear en Git**:
- `node_modules/` - Dependencias (se instalan con `npm install`)
- `dist/` - Código compilado (se regenera con `npm run build`)
- `.env` - Variables de entorno sensibles
- `.env.local` - Variables locales
- `.vscode/` - Configuración personal del IDE
- `.DS_Store` - Archivos del sistema Mac

### 10. Crear `vitest.config.ts`
Configuración de Vitest para los tests:
- **`globals: true`** - Permite usar `describe`, `it`, `expect` sin necesidad de importarlos
- **`environment: 'node'`** - Ejecuta tests en ambiente Node.js (no navegador)
- **`include: ['tests/**/*.spec.ts', 'src/**/*.spec.ts']`** - Busca archivos de test en tests/ y src/ con extensiones `.spec.ts`
- **`exclude: ['node_modules', 'dist']`** - Excluye carpetas innecesarias
- **`coverage`** - Configuración de reportes de cobertura:
  - `provider: 'v8'` - Usa el motor de cobertura V8
  - `reporter: ['text', 'json', 'html']` - Genera reportes en texto, JSON y HTML
- **`resolve.alias`** - Define alias para importaciones limpias en tests

### 11. Configurar Alias de Carpetas (Domain-Driven Design)
Se añadieron alias en `tsconfig.json` y `vitest.config.ts` para seguir arquitectura DDD:

**Alias disponibles:**
- **`@domain`** → `src/domain` - Lógica de negocio (entidades, value objects, interfaces)
- **`@application`** → `src/application` - Casos de uso y servicios de aplicación
- **`@infrastructure`** → `src/infrastructure` - Implementaciones técnicas (BD, HTTP, etc.)
- **`@composition`** → `src/composition` - Inyección de dependencias y composición
- **`@shared`** → `src/shared` - Código compartido (utilidades, tipos, constantes)
- **`@`** → `src` - Raíz de src (para imports generales)

**Ejemplo de imports:**
```typescript
import { Order } from '@domain/entities';
import { CreateOrderUseCase } from '@application/use-cases';
import { PostgresRepository } from '@infrastructure/repositories';
import { Container } from '@composition/container';
import { Logger } from '@shared/utils';
```

### 12. Crear Patrón Result (`src/shared/Result.ts`)
Implementamos un patrón Result para manejo robusto de errores sin excepciones:

**Clases:**
- **`Success<T>`** - Representa un resultado exitoso con valor de tipo T
- **`Failure<E>`** - Representa un fallo/error de tipo E

**Métodos disponibles:**
- **`isSuccess()` / `isFailure()`** - Chequear el estado del resultado
- **`map(fn)`** - Transformar el valor en caso de éxito
- **`flatMap(fn)`** - Encadenar operaciones que devuelven Result
- **`getOrThrow()`** - Obtener valor o lanzar excepción

**Funciones helper:**
- **`ok(value)`** - Crear un Success
- **`err(error)`** - Crear un Failure

**Ventajas:**
- Evita try-catch innecesarios
- Fuerza el manejo explícito de errores
- Type-safe: el compilador sabe qué tipo de error esperar
- Permite encadenamiento de operaciones

**Ejemplo de uso:**
```typescript
import { ok, err, type Result } from '@shared/Result';

function divide(a: number, b: number): Result<number, string> {
  if (b === 0) return err('División por cero');
  return ok(a / b);
}

const result = divide(10, 2);
if (result.isSuccess()) {
  console.log(result.value); // 5
} else {
  console.log('Error:', result.error);
}
```

## Estructura Final del Proyecto

```
clean-orders/
├── src/
│   └── index.ts              ← Archivo principal de la aplicación
├── dist/                     ← Código compilado (generado con npm run build)
├── node_modules/             ← Dependencias (generadas con npm install)
├── package.json              ← Configuración del proyecto y scripts
├── package-lock.json         ← Lock file de npm
├── tsconfig.json             ← Configuración de TypeScript
├── vitest.config.ts          ← Configuración de tests
├── .gitignore                ← Archivos a ignorar en Git
├── README.md                 ← Documentación formal
└── SETUP.md                  ← Este archivo (documentación del proceso)
```

## Comandos Disponibles

```bash
# Desarrollo (ejecuta una sola vez)
npm run dev

# Compilar TypeScript a JavaScript
npm run build

# Ejecutar en producción
npm start

# Ejecutar tests una sola vez
npm test
```

## Cambios Realizados por el Usuario

### En `tsconfig.json`:
- Cambió `module` de ESNext a **NodeNext** (mejor soporte para Node.js)
- Cambió `rootDir` de "./src" a **"."** (incluye raíz completa)
- Cambió `baseUrl` de "./src" a **"."** (punto de referencia en raíz)
- Cambió `moduleResolution` de "bundler" a **"NodeNext"** (resolución específica)
- Actualizó `include` de ["src"] a **["src/**/*.ts", "main.ts"]** (más explícito)
- Añadió **"tests"** a `exclude` (excluir carpeta de tests)
- Añadió **alias de carpetas** para DDD: `@domain`, `@application`, `@infrastructure`, `@composition`, `@shared`

### En `package.json`:
- Actualizó script `dev` de `tsx watch src/index.ts` a **`tsx src/index.ts`** (sin watch)
- Actualizó script `build` a **`tsc -p tsconfig.json`** (explícito con config)
- Actualizó script `test` de `vitest` a **`vitest run`** (no en modo watch)

### En `vitest.config.ts`:
- Añadió alias de carpetas con `resolve.alias` para coincidencia con `tsconfig.json`
- Actualizó `include` a **`['tests/**/*.spec.ts', 'src/**/*.spec.ts']`** (busca en ambas carpetas)
- Usó `resolve()` de path para rutas absolutas más robustas

## Próximos Pasos

1. **Crear `src/index.ts`** con un servidor Fastify básico
2. **Probar** con `npm run dev`
3. **Crear rutas y controladores** para la lógica del negocio
4. **Escribir tests** con Vitest
5. **Compilar** con `npm run build` cuando esté listo para producción
6. **Hacer commit** con `git add .` y `git commit -m "Initial setup"`

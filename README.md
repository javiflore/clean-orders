# Clean Orders

Servicio Node.js con TypeScript, Fastify y Vitest.

## Configuración del Proyecto

### 1. Package.json
- **`type: "module"`** - Habilita ES modules (import/export en lugar de require)
- **Scripts configurados:**
  - `npm run dev` - Ejecuta en desarrollo con tsx en modo watch (recarga automática)
  - `npm run build` - Compila TypeScript a JavaScript en dist/
  - `npm start` - Ejecuta el código compilado en producción
  - `npm test` - Ejecuta tests con vitest

### 2. TypeScript (tsconfig.json)
Configuración con:
- **`target: ES2020`** - Versión moderna de JavaScript
- **`module: ESNext`** - Para usar módulos ES
- **`outDir: dist`** - Salida compilada
- **`rootDir: src`** - Entrada desde src
- **`baseUrl` y `paths`** - Alias `@/*` apunta a src para imports limpios
- **`strict: true`** - Todas las opciones strict habilitadas
- **`declaration: true`** - Genera archivos .d.ts
- **`sourceMap: true`** - Mapeo de fuentes para debugging

### 3. Dependencias Instaladas

**Producción:**
- `fastify` - Framework web de alto rendimiento

**Desarrollo:**
- `typescript` - Compilador de TypeScript
- `ts-node` - Ejecutor de TypeScript directo
- `tsx` - Executor moderno de TypeScript (en scripts)
- `vitest` - Framework de testing moderno
- `@types/node` - Tipos TypeScript para APIs de Node.js

## Estructura del Proyecto

```
clean-orders/
├── src/
│   └── index.ts          # Punto de entrada
├── dist/                 # Código compilado (generado)
├── node_modules/         # Dependencias
├── package.json
├── tsconfig.json
└── README.md
```

## Comandos Disponibles

```bash
# Desarrollo (recarga automática)
npm run dev

# Compilar TypeScript
npm run build

# Ejecutar en producción
npm start

# Ejecutar tests
npm test
```

## Próximos Pasos

- Crear `src/index.ts` con servidor Fastify básico
- Añadir rutas y controladores
- Escribir tests con Vitest
- Añadir validación con Zod (si se necesita)

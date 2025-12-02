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

## Implementación del Dominio (hecho)

He implementado el modelo de dominio del dominio de pedidos y lo he añadido bajo `src/domain`:

- `src/domain/value-objects/OrderId.ts` — Value object para identificador de pedido (no vacío).
- `src/domain/value-objects/ProductId.ts` — Value object para identificador de producto (no vacío).
- `src/domain/value-objects/Currency.ts` — Value object para código de moneda ISO-4217 (3 letras mayúsculas).
- `src/domain/value-objects/Money.ts` — Representación en centavos (`cents`) y operaciones (`add`, `multiply`, `fromDecimal`, `toDecimal`).
- `src/domain/value-objects/Quantity.ts` — Cantidad (entero positivo).
- `src/domain/OrderItem.ts` — Entidad ligera que agrupa `ProductId`, `unitPrice: Money` y `quantity: Quantity` y calcula `total()`.
- `src/domain/Order.ts` — Aggregate root `Order` con métodos:
  - `static create(orderId: OrderId)` — crea y registra evento `OrderCreated`.
  - `addItem(item: OrderItem)` — añade item y registra evento `ItemAdded`.
  - `getItems()` — retorna items (solo lectura).
  - `totalsByCurrency()` — suma los totales por moneda y devuelve `Record<string, Money>`.
  - `pullEvents()` — recupera y limpia los eventos producidos por la agregación.
- `src/domain/events/*` — eventos de dominio (`DomainEvent`, `OrderCreated`, `ItemAdded`) con payloads claros.

Ejemplo corto de uso (puro dominio, sin IO):
```ts
import { Order } from './src/domain/Order';
import { OrderId } from './src/domain/value-objects/OrderId';
import { ProductId } from './src/domain/value-objects/ProductId';
import { Currency } from './src/domain/value-objects/Currency';
import { Money } from './src/domain/value-objects/Money';
import { Quantity } from './src/domain/value-objects/Quantity';
import { OrderItem } from './src/domain/OrderItem';

const order = Order.create(new OrderId('order-1'));
const usd = new Currency('USD');
const item = new OrderItem(new ProductId('p-1'), Money.fromDecimal(12.5, usd), new Quantity(2));
order.addItem(item);
console.log(order.totalsByCurrency()); // { USD: Money }
console.log(order.pullEvents()); // eventos OrderCreated, ItemAdded
```

Notas:
- El patrón `Money` usa enteros (`cents`) para evitar errores de coma flotante.
- `totalsByCurrency()` permite sumar items en monedas distintas y obtener un resumen por código de moneda.
- No hay IO ni dependencias externas; el dominio es puro y testeable.

## Capa de Aplicación (errores, puertos, DTOs y casos de uso)

He añadido una capa de aplicación con errores especializados, puertos (interfaces) para dependencias externas y dos casos de uso:

- **Errores** (`src/application/errors`):
  - `AppError` (base)
  - `ValidationError`
  - `NotFoundError`
  - `ConflictError`
  - `InfraError`

- **Puertos** (`src/application/ports`): interfaces que representan dependencias externas:
  - `OrderRepository` — `findById(id): Promise<Order|null>` y `save(order): Promise<void>`
  - `PricingService` — `getPrice(productId, currency): Promise<Money>`
  - `EventBus` — `publish(event): Promise<void>`
  - `Clock` — `now(): string` (ISO timestamp)

- **DTOs** (`src/application/dtos`):
  - `CreateOrderDTO` — `{ orderId: string }`
  - `AddItemToOrderDTO` — `{ orderId, productId, sku?, quantity, unitPrice? }`

- **Casos de uso** (`src/application/use-cases`):
  - `CreateOrder` — crea un pedido si no existe; devuelve `Result<void, ConflictError|InfraError|ValidationError>`
  - `AddItemToOrder` — añade un item al pedido (crea `OrderItem` con `Sku` opcional); devuelve `Result<void, NotFoundError|ValidationError|InfraError|ConflictError>`

Los casos de uso devuelven el tipo `Result` (`ok` o `err`) desde `src/shared/Result.ts` y, en caso de error, retornan instancias de los errores discriminados (cada error tiene la propiedad `type` para distinguirlo).

La capa de aplicación no realiza IO por sí misma: las dependencias externas quedan expresadas como puertos y deben ser implementadas por la infraestructura (repositorios, servicios de precio, bus de eventos).







- añadimos postgres, pino ,pino-pretty, dotenv y zod

# UI Components

Reusable UI components for the L9 Equipment Manager application.

## Components

### Button
Primary action buttons with multiple variants.

```tsx
import { Button } from "@/components/ui";

// Primary button
<Button variant="primary" onClick={handleClick}>
  Save Changes
</Button>

// Secondary button
<Button variant="secondary" onClick={handleCancel}>
  Cancel
</Button>

// Danger button
<Button variant="danger" onClick={handleDelete}>
  Delete
</Button>

// With loading state
<Button variant="primary" isLoading={isSubmitting}>
  Submit
</Button>

// Different sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
```

**Props:**
- `variant`: "primary" | "secondary" | "danger" | "ghost"
- `size`: "sm" | "md" | "lg"
- `isLoading`: boolean
- All standard button HTML attributes

---

### Card
Container component for content sections.

```tsx
import { Card, CardHeader, CardBody, CardFooter } from "@/components/ui";

<Card variant="glass">
  <CardHeader action={<Button size="sm">Refresh</Button>}>
    Dashboard Stats
  </CardHeader>
  <CardBody>
    <p>Your content here...</p>
  </CardBody>
  <CardFooter>
    <Button variant="secondary">Cancel</Button>
    <Button variant="primary">Save</Button>
  </CardFooter>
</Card>
```

**Props:**
- `variant`: "default" | "glass" | "bordered"
- `padding`: "none" | "sm" | "md" | "lg"

---

### Modal
Modal dialog with overlay.

```tsx
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/ui";

<Modal 
  isOpen={isOpen} 
  onClose={() => setIsOpen(false)}
  size="md"
>
  <ModalHeader onClose={() => setIsOpen(false)}>
    Edit Profile
  </ModalHeader>
  <ModalBody>
    <p>Modal content...</p>
  </ModalBody>
  <ModalFooter>
    <Button variant="secondary" onClick={() => setIsOpen(false)}>
      Cancel
    </Button>
    <Button variant="primary" onClick={handleSave}>
      Save
    </Button>
  </ModalFooter>
</Modal>
```

**Props:**
- `isOpen`: boolean
- `onClose`: () => void
- `size`: "sm" | "md" | "lg" | "xl" | "full"
- `closeOnOverlayClick`: boolean (default: true)
- `closeOnEscape`: boolean (default: true)

---

### Input
Text input field with label and error states.

```tsx
import { Input } from "@/components/ui";

<Input
  label="Username"
  placeholder="Enter your username"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
  required
  error={errors.username}
  helperText="Choose a unique username"
/>

// With icons
<Input
  label="Search"
  leftIcon={<SearchIcon />}
  placeholder="Search items..."
/>
```

**Props:**
- `label`: string
- `error`: string
- `helperText`: string
- `leftIcon`: ReactNode
- `rightIcon`: ReactNode
- All standard input HTML attributes

---

### Select
Dropdown select component.

```tsx
import { Select } from "@/components/ui";

<Select
  label="Equipment Type"
  value={type}
  onChange={(e) => setType(e.target.value)}
  required
  error={errors.type}
>
  <option value="">Select type...</option>
  <option value="gear">⚙️ Gear</option>
  <option value="special">✨ Special</option>
</Select>
```

**Props:**
- `label`: string
- `error`: string
- `helperText`: string
- All standard select HTML attributes

---

### Textarea
Multi-line text input.

```tsx
import { Textarea } from "@/components/ui";

<Textarea
  label="Description"
  placeholder="Enter description..."
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  rows={4}
  error={errors.description}
/>
```

**Props:**
- `label`: string
- `error`: string
- `helperText`: string
- All standard textarea HTML attributes

---

## Design Tokens

All components use consistent design tokens from your game theme:

- **Colors:**
  - `game-accent` - Primary accent color
  - `game-card` - Card backgrounds
  - `game-dark` - Dark backgrounds
  - `game-border` - Border colors
  - `game-danger` - Danger/error states
  - `game-text` - Primary text
  - `game-text-muted` - Secondary text

- **Focus States:** All interactive components include clear focus indicators (border highlights) for accessibility

- **Disabled States:** Reduced opacity and cursor changes

- **Transitions:** Smooth color transitions on hover/focus

## Usage

Import components from the centralized index:

```tsx
import { 
  Button, 
  Card, 
  CardHeader, 
  Input, 
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter 
} from "@/components/ui";
```

### Wrappers

This directory exists in order to provide consistent component APIs for the rest of
NavigaDER regardless of the rendering library that is used under the hood. The intent is
to hedge risk against library deprecation, which can be a huge setback once the library has
widespread usage within the app. By providing wrapper components with consistent APIs,
swapping rendering libraries is only as difficult as adjusting how the wrappers use the
library components.

The most basic wrapper is one which takes some props and renders the wrapped component
using those props. If the NavigaDER application has no need to customize behavior, then
this basic wrapping will suffice.

### A note on styling

We will often want to apply custom styling to components that are created by a rendering
library. Ideally this use-case can be handled using [JSS](https://cssinjs.org/react-jss/?v=v10.0.0-alpha.10)
but this is not always possible. In such situations it can be tempting to use class names
provided to the rendered elements by the rendering library, but doing so introduces a
dependency.

```jsx harmony
const LibraryComponent = ({ children }) => {
  return <div className="lib-component">{children}</div>;
};
```

If we wanted to style this component (e.g. make its background red), it would be tempting
to write the following:

```css
.lib-component {
  background-color: red;
}
```

But now our CSS depends on the rendering library to provide the `.lib-component` class name
to the component. Switching rendering libraries all but guarantees the class name will no
longer be provided, so this introduces fragility into our stylesheets. A better approach
is to wrap the component:

```jsx harmony
import { LibraryComponent } from 'rendering-library';

const WrappedComponent = (props) => {
  return (
    <div className="navigader-component">
      <LibraryComponent {...props} />
    </div>
  );
};
```

This enables us to target the `.navigader-component` class instead:

```css
.navigader-component {
  background-color: red;
}
```

Ultimately it may be impossible to fully decouple the styles from the rendering library.
This is a best practice to follow, but by no means a guarantee.
import PropTypes from 'prop-types';
import { isValidElementType } from 'react-is';

/* const { checkPropTypes } = PropTypes;

PropTypes.checkPropTypes = (...args) => {
  const { error } = console;
  console.error = (message) => {
    throw new Error(message);
  };

  checkPropTypes(...args);

  Object.assign(console, { error });
}; */

function isComponent(props, propName, componentName) {
  if (!props[propName]) {
    if (this.isRequired) {
      return new Error(`\`${componentName}\` missing required prop \`${propName}\``);
    }
  } else if (!isValidElementType(props[propName])) {
    return new Error(
      `Invalid prop \`${propName}\` supplied to \`${componentName}\`, expected a React component.`
    );
  }
}
export const component = Object.assign(isComponent, {
  isRequired: (...args) => isComponent.apply({ isRequired: true }, args),
});

export default PropTypes;

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

function isComponent(...args) {
  let propName;
  let propValue;
  let componentName;
  if (args[4] === null) {
    let props;
    [props, propName, componentName] = args;
    propValue = props[propName];
  } else { // Used inside arrayOf
    let key;
    [propValue, key, componentName,, propName] = args;
    propValue = propValue[key];
  }

  if (!propValue) {
    if (this.isRequired) {
      return new Error(`\`${componentName}\` missing required prop \`${propName}\``);
    }
  } else if (!isValidElementType(propValue)) {
    return new Error(
      `Invalid prop \`${propName}\` supplied to \`${componentName}\`, expected a React component.`
    );
  }
}
const component = Object.assign(isComponent, {
  isRequired: (...args) => isComponent.apply({ isRequired: true }, args),
});
Object.assign(PropTypes, { component });

export default PropTypes;

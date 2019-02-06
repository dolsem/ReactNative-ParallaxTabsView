import PropTypes from 'prop-types';

const { checkPropTypes } = PropTypes;

PropTypes.checkPropTypes = (...args) => {
  const { error } = console;
  console.error = (message) => {
    throw new Error(message);
  };

  checkPropTypes(...args);

  Object.assign(console, { error });
};

export default PropTypes;

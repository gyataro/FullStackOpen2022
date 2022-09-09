import PropTypes from 'prop-types'

const style = {
  base: {
    padding: '10px',
    margin: '10px'
  },
  error: {
    color: '#ba3939',
    background: '#ffe0e0',
    border: '1px solid #a33a3a'
  },
  success: {
    color: '#2b7515',
    background: '#ecffd6',
    border: '1px solid #617c42'
  }
}

const Message = ({ text, type }) => {
  if(text) {
    return (
      <div style={{ ...style['base'], ...style[type] }}>{text}</div>
    )
  }

  return null
}

Message.propTypes = {
  text: PropTypes.string,
  type: PropTypes.oneOf(['error', 'success'])
}

export default Message
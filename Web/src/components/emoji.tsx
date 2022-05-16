function Emoji({symbol, label}) {
    return <span role="img" aria-label={label} aria-hidden="false">{symbol}</span>
}

export default Emoji;
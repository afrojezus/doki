function Emoji({ symbol, label, style = undefined }) {
    return <span style={style} role="img" aria-label={label} aria-hidden="false">{symbol}</span>;
}

export default Emoji;
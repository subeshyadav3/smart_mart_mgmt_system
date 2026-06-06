export default function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  ...props
}) {
  const classes = ['btn', `btn-${variant}`, `btn-${size}`, className].filter(Boolean).join(' ');
  return <Component type={Component === 'button' ? type : undefined} className={classes} {...props} />;
}

import { Button, ButtonProps, Tooltip, TooltipProps } from '@mui/material';

type TButtonWithTooltipProps = {
  title: string;
  placement?: TooltipProps['placement'];
} & ButtonProps;

const ButtonWithTooltip = ({
  title,
  disabled,
  placement = 'bottom',
  ...rest
}: TButtonWithTooltipProps) => {
  if (disabled) {
    return <Button disabled={disabled} {...rest}></Button>;
  }

  return (
    <Tooltip title={title} placement={placement}>
      <Button {...rest}></Button>
    </Tooltip>
  );
};

export default ButtonWithTooltip;

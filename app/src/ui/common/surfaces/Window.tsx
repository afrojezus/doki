import React, { PropsWithChildren, ReactNode } from 'react';
import {
  Button,
  Container,
  Dialog, DialogContent, DialogProps, Divider, Toolbar, Typography,
} from '@mui/material';

interface WindowProps extends DialogProps {
    open: boolean;
    onClose: () => void;
    toolbarRight?: PropsWithChildren<ReactNode>;
    children: PropsWithChildren<ReactNode>;
    title: string;
    disabledGutters?: boolean;
}

function Window(props: WindowProps) {
  return (
    <Dialog onClose={props.onClose} open={props.open} fullScreen={props.fullScreen} TransitionComponent={props.TransitionComponent} maxWidth={props.maxWidth} fullWidth={props.fullWidth}>
      {props.fullScreen ? (
        <>
          <Toolbar variant="dense" disableGutters sx={{ padding: (theme) => theme.spacing(1, 2), paddingTop: 8, background: (theme) => theme.palette.background.paper }}>
            <Container maxWidth="lg" sx={{ display: 'flex', flexFlow: 'row wrap' }}>
              <Typography variant="h3" sx={{ fontWeight: 700, fontFamily: 'doublewide', textTransform: 'uppercase' }}>{props.title}</Typography>
              <div style={{ flex: 1 }} />
              <Button onClick={props.onClose} color="inherit" sx={{ margin: 1 }}>
                Cancel
              </Button>
              {props.toolbarRight}
            </Container>
          </Toolbar>
          <DialogContent dividers sx={{ overflowX: 'hidden', padding: 0, paddingTop: 1 }}>
            <Container maxWidth="lg">
              {props.children}
            </Container>

          </DialogContent>
        </>
      ) : (
        <>
          <Toolbar variant="dense" disableGutters sx={{ padding: (theme) => theme.spacing(0, 2), background: (theme) => theme.palette.background.paper }}>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 14 }}>{props.title}</Typography>
            <div style={{ flex: 1 }} />
            {props.toolbarRight}
          </Toolbar>
          <Divider />
          <DialogContent sx={{ overflowX: 'hidden', padding: props.disabledGutters ? 0 : undefined }}>
            {props.children}
          </DialogContent>
        </>
      )}
    </Dialog>
  );
}

export default Window;

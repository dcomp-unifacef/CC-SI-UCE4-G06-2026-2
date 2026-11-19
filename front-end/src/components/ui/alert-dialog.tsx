import * as React from 'react'
import { AlertDialog as AlertDialogPrimitive } from '@base-ui/react/alert-dialog'

export function AlertDialog({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root {...props} />
}

export function AlertDialogTrigger({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return <AlertDialogPrimitive.Trigger {...props} />
}

export function AlertDialogPortal({
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return <AlertDialogPrimitive.Portal {...props} />
}

export function AlertDialogBackdrop({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Backdrop>) {
  return (
    <AlertDialogPrimitive.Backdrop
      className={`auctus-alert-dialog-backdrop ${className ?? ''}`}
      {...props}
    />
  )
}

export function AlertDialogContent({
  className,
  children,
  size = 'default',
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Popup> & {
  size?: 'default' | 'sm'
}) {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Backdrop className="auctus-alert-dialog-backdrop" />
      <AlertDialogPrimitive.Viewport className="auctus-alert-dialog-viewport">
        <AlertDialogPrimitive.Popup
          className={`auctus-alert-dialog-content ${size === 'sm' ? 'is-sm' : ''} ${className ?? ''}`}
          {...props}
        >
          {children}
        </AlertDialogPrimitive.Popup>
      </AlertDialogPrimitive.Viewport>
    </AlertDialogPrimitive.Portal>
  )
}

export function AlertDialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`auctus-alert-dialog-header ${className ?? ''}`}
      {...props}
    />
  )
}

export function AlertDialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`auctus-alert-dialog-footer ${className ?? ''}`}
      {...props}
    />
  )
}

export function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      className={`auctus-alert-dialog-title ${className ?? ''}`}
      {...props}
    />
  )
}

export function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      className={`auctus-alert-dialog-description ${className ?? ''}`}
      {...props}
    />
  )
}

export interface AlertDialogActionProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'destructive'
}

export function AlertDialogAction({
  className,
  variant = 'primary',
  type = 'button',
  ...props
}: AlertDialogActionProps) {
  return (
    <AlertDialogPrimitive.Close
      className={`auctus-alert-action-btn ${variant === 'destructive' ? 'is-destructive' : 'is-primary'} ${className ?? ''}`}
      render={<button type={type} />}
      {...props}
    />
  )
}

export function AlertDialogCancel({
  className,
  type = 'button',
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Close>) {
  return (
    <AlertDialogPrimitive.Close
      className={`auctus-alert-cancel-btn ${className ?? ''}`}
      render={<button type={type} />}
      {...props}
    />
  )
}

export function AlertDialogMedia({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`auctus-alert-dialog-media ${className ?? ''}`}
      {...props}
    />
  )
}

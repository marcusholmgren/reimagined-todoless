import React from 'react'
import { Message } from 'semantic-ui-react'

interface Props {
  header: String
  message: String
}

export function WarningMessage ({header, message}: Props) {
  return (
    <Message warning>
      <Message.Header>{header}</Message.Header>
      <p>{message}</p>
    </Message>
  )
}


export function ErrorMessage ({header, message}: Props) {
  return (
    <Message negative>
      <Message.Header>{header}</Message.Header>
      <p>{message}</p>
    </Message>
  )
}

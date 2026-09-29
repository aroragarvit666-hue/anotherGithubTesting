import React, { useState } from 'react'
import {
  Provider,
  defaultTheme,
  View,
  Flex,
  Heading,
  Content,
  TextField,
  Button,
  Well,
  InlineAlert,
  ProgressCircle
} from '@adobe/react-spectrum'
import actions from '../config.json'

export default function App({ runtime, ims }) {
  // Do NOT call runtime.done() here — index.js calls it in the ready handler
  const helloUrl = actions['hello'] // exact action name from app.config.yaml

  const [name, setName] = useState('')
  const [greeting, setGreeting] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  async function sayHello() {
    setError(null)
    setGreeting(null)

    if (!helloUrl) {
      // config.json is empty until deploy/preview fills it in
      setError('Action URL not available yet. Deploy the app (aio app deploy) or run the sandbox preview first.')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(helloUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ims.token}`,
          'x-gw-ims-org-id': ims.org
        },
        body: JSON.stringify({ name })
      })
      if (!res.ok) throw new Error(`Action failed: ${res.status}`)
      const data = await res.json()
      setGreeting(data.message)
    } catch (e) {
      setError(e.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Provider theme={defaultTheme} colorScheme="light">
      <View padding="size-400" maxWidth="size-6000" margin="0 auto">
        <Flex direction="column" gap="size-300">
          <Heading level={1}>Hello World</Heading>
          <Content>
            Enter a name and greet it through an Adobe I/O Runtime action.
            Leave it blank to greet the World.
          </Content>

          <TextField
            label="Name"
            value={name}
            onChange={setName}
            placeholder="World"
            width="100%"
            onKeyDown={(e) => {
              if (e.key === 'Enter') sayHello()
            }}
          />

          <Flex gap="size-200" alignItems="center">
            <Button variant="accent" onPress={sayHello} isPending={isLoading}>
              Say Hello
            </Button>
            {isLoading && <ProgressCircle aria-label="Calling action" isIndeterminate size="S" />}
          </Flex>

          {greeting && (
            <Well>
              <Heading level={3} marginTop="size-0">{greeting}</Heading>
            </Well>
          )}

          {error && (
            <InlineAlert variant="negative">
              <Heading>Error</Heading>
              <Content>{error}</Content>
            </InlineAlert>
          )}
        </Flex>
      </View>
    </Provider>
  )
}

import Head from 'next/head'
// import Image from 'next/image'
// import styles from '../styles/Home.module.css'
import {
  Box, Card,
  CardHeader, CardBody,
  CardFooter, Grommet, Form,
  FormField, TextInput, Button
} from 'grommet'

export default function Home () {
  return (
    <Grommet plain>
      <Head>
        <title>ORCA Year In Review</title>
      </Head>
      <Box align='center' justify='center' height='100vh'>
        <Card pad='small' background='dark-1' gap='medium' width='medium'>
          <Form onSubmit={({ value }) => {}}>
            <CardHeader>Sign In To Your ORCA Account</CardHeader>
            <CardBody>
              <FormField name='name' htmlFor='textinput-id' label='Username'>
                <TextInput id='textinput-id' name='name' />
              </FormField>
              <FormField name='name' htmlFor='textinput-id' label='Password'>
                <TextInput id='textinput-id' name='name' />
              </FormField>
            </CardBody>
            <CardFooter>
              <Box direction='row' gap='medium'>
                <Button type='submit' primary label='Submit' />
                <Button type='reset' label='Upload My Own' />
              </Box>
            </CardFooter>
          </Form>
        </Card>
      </Box>
    </Grommet>
  )
}

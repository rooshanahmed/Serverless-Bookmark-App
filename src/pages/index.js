import React from "react"
import { useMutation, useQuery } from "@apollo/client"
import gql from "graphql-tag"

const BOOKMARK_QUERY = gql`
{
  bookmark {
    id,
    url,
    desc
  }
}
`

const BOOKMARK_MUTATION = gql`
  mutation addBookmark($url: String!, $desc: String!){
    addBookmark(url: $url, desc: $desc){
      url,
      desc
    }
  }
`

export default function Home() {
  const { loading, error, data } = useQuery(BOOKMARK_QUERY);
  const [ addBookmark ] = useMutation(BOOKMARK_MUTATION);
  let textField;
  let desc;

  const SubmitBookmark = () => {
    addBookmark({
      variables: {
        url: textField.value,
        desc: desc.value
      },
      refetchQueries: [{ query: BOOKMARK_QUERY }],
    })
    console.log(textField.value)
    console.log(desc.value)
  }
  
  if(loading){
    return <h1>Loading..!!</h1>
  }
  return (
    <div>
      <p>{JSON.stringify(data)}</p>
      <div>
        <input type='text' ref={node => textField=node} />
        <input type='text' ref={node => desc=node} />
      </div>
      <button onClick={SubmitBookmark}>Add Bookmark</button>
    </div>
  )
}

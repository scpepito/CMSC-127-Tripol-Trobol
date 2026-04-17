import { Search } from 'lucide-react'
import TextInput from './TextInput.jsx'

export default function SearchInput(props) {
  return <TextInput leftIcon={<Search className="size-5" />} {...props} />
}


import { Icon } from '@chakra-ui/react'

const MediumIcon: React.FC = (props) => (
  <Icon xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"  {...props} >
    <circle cx="14" cy="24" r="12" fill="#424242" />
    <ellipse cx="34" cy="24" fill="#424242" rx="6" ry="11" />
    <ellipse cx="44" cy="24" fill="#424242" rx="2" ry="10" />
  </Icon>
)

export default MediumIcon
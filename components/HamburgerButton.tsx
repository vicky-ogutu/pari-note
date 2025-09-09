// components/HamburgerButton.tsx
import { Text, TouchableOpacity } from 'react-native';
import tw from 'tailwind-react-native-classnames';

interface HamburgerButtonProps {
  onPress: () => void;
  position?: 'absolute' | 'relative';
  style?: string;
}

const HamburgerButton: React.FC<HamburgerButtonProps> = ({ 
  onPress, 
  position = 'relative',
  style = '' 
}) => {
  return (
    <TouchableOpacity 
      style={tw`${position === 'absolute' ? 'absolute top-10 left-5 z-10' : ''} bg-purple-500 p-2 rounded-lg ${style}`}
      onPress={onPress}
    >
      <Text style={tw`text-white font-bold text-xl`}>☰</Text>
    </TouchableOpacity>
  );
};

export default HamburgerButton;
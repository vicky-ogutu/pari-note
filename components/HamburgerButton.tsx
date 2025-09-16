import { MenuIcon } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity } from 'react-native';
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
      style={tw`${position === 'absolute' ? 'absolute top-10 left-5 z-10' : ''} p-2 rounded-lg ${style}`}
      onPress={onPress}
    >
      <MenuIcon color="#9C27B0" style={tw`h-5 w-5`} size={38} />
      {/* <Text style={tw`text-white font-bold text-xl text-purple-500`}> ☰</Text> */}
    </TouchableOpacity>
  );
};

export default HamburgerButton;
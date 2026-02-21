import { View, Text, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function Home() {
  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <ScrollView className="flex-1">
        <View className="flex-1 items-center justify-center p-6 min-h-screen">
          <Text className="text-4xl font-bold mb-4 text-center">
            Agendamento SaaS
          </Text>
          <Text className="text-xl text-gray-600 mb-8 text-center">
            App Mobile - React Native + Expo
          </Text>

          <View className="w-full space-y-4">
            <View className="p-6 border border-gray-300 rounded-lg mb-4">
              <Text className="text-xl font-semibold mb-2">Buscar</Text>
              <Text className="text-gray-600">
                Encontre estabelecimentos próximos
              </Text>
            </View>

            <View className="p-6 border border-gray-300 rounded-lg mb-4">
              <Text className="text-xl font-semibold mb-2">Agendar</Text>
              <Text className="text-gray-600">
                Agende seus serviços facilmente
              </Text>
            </View>

            <View className="p-6 border border-gray-300 rounded-lg">
              <Text className="text-xl font-semibold mb-2">Histórico</Text>
              <Text className="text-gray-600">
                Veja seus agendamentos anteriores
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

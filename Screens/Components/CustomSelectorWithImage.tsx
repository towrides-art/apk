import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View,ScrollView, Image } from "react-native";
 import Modal from "react-native-modal";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../src/theme/ThemeProvider';

const CustomSelectorWithImage = ({
 
selected_value,
set_selected_value,
SelectName,
SelectIcon,
selecties,
style
}:any)=>{
  const { theme } = useTheme();
 const [renderContent,setrenderContent] = useState(false);
 const [custom_selector_visible,set_custom_selector_visible]= useState(false)
useEffect(() => {
    if (custom_selector_visible) {
      setTimeout(() => {
        setrenderContent(true);
      }, 50);
    } else {
      setrenderContent(false);
    }
  }, [custom_selector_visible]);
  const setSelectedFn =(value)=>{
set_selected_value(value);
set_custom_selector_visible(false);

  }
  const selectedItem = selecties.find(item => item.value === selected_value);

    return(<>
    <TouchableOpacity
  onPress={() => set_custom_selector_visible(true)}
  style={[
    style,
    {
      backgroundColor: theme.colors.surface.primary,
      borderRadius: 15,
      padding: 15,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
    },
  ]}
>
  <View
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1, // allow child to grow
    }}
  >
    {selectedItem?.image ? (
      <Image
        source={selectedItem.image}
        style={{
          width: 100,          // big width
          aspectRatio: 1,      // auto height
          borderRadius: 12,
          marginRight: 12,
        }}
        resizeMode="contain"   // show full image without cropping
      />
    ) : (
      <MaterialIcons
        name={SelectIcon}
        size={28}
        color={theme.colors.text.primary}
        style={{
          marginRight: 12,
          backgroundColor: theme.colors.surface.secondary,
          borderRadius: 20,
          
        }}
      />
    )}

    <Text
      style={{
        fontSize: 22,
        fontWeight: '500',
        flexShrink: 1, // prevent text from pushing the image out
        color: theme.colors.text.primary,
      }}
    >
      {selectedItem?.label ?? `${SelectName} Type`}
    </Text>
  </View>

  <MaterialIcons
    name="arrow-forward-ios"
    size={20}
    color={theme.colors.text.primary}
    style={{
      backgroundColor: theme.colors.surface.secondary,
      borderRadius: 20,
    }}
  />
</TouchableOpacity>



     <Modal
      isVisible={custom_selector_visible}
      onBackdropPress={() => set_custom_selector_visible(false)}
      style={{ justifyContent: 'flex-end', margin: 0 }}
      
    >
      {renderContent ? (
        <>
          <View
            style={{
              backgroundColor: theme.colors.surface.primary,
             
              borderTopRightRadius: 25,
              borderTopLeftRadius: 25,
              
            }}
          >
                      <ScrollView
                  showsVerticalScrollIndicator={true}
                  contentContainerStyle={{ padding: 20, paddingBottom: 30 }}
                >
             <Text style={{fontSize:22}}>Select {SelectName}</Text>
             <View style={{display:'flex', gap:10}}>
{selecties.map((item, i) => (
  <TouchableOpacity onPress={()=>setSelectedFn(item.value)} key={i} style={{
    borderRadius:10,
    borderWidth:1,  paddingInline:20, height:50,  display:'flex',flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>

  <Text style={{fontSize:18}} key={i}>{item.label}</Text>
  {selected_value==item.value ? (
<MaterialIcons
          name="task-alt"
           size={30}
          color="#f37f21"
          style={{
             
            margin: 5,
            borderColor: '#f37f21',
            borderRadius: 20,
            backgroundColor: '#fff',
          }}
        />
  ):(
     <MaterialIcons
          name="radio-button-unchecked"
           size={30}
          color="#f37f21"
          style={{
             
            margin: 5,
            borderColor: '#f37f21',
            borderRadius: 20,
            backgroundColor: '#fff',
          }}
        />
  )}
    
         
  </TouchableOpacity>
))}
</View>
 </ScrollView>
          </View>

         
        </>
      ) : null}
    </Modal>
    </>);
}
export default CustomSelectorWithImage;
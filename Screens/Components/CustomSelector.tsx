import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View,ScrollView } from "react-native";
 import Modal from "react-native-modal";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../src/theme/ThemeProvider';

const CustomSelector = ({
 
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
    <TouchableOpacity onPress={()=>set_custom_selector_visible(true)}
     style={[style,{
      backgroundColor: theme.colors.surface.primary,
      borderRadius:15,
      padding:10,
      display:'flex',alignItems:'center', flexDirection:"row",justifyContent:'space-between',paddingInline:16, }]}>

<View style={{display:'flex',flexDirection:'row',alignItems:'center'}}>
  <MaterialIcons
          name={SelectIcon}
           size={28}
          color={theme.colors.text.primary}
          style={{
             
            margin: 5,
            marginRight:10,
            borderColor: theme.colors.border.primary,
            borderRadius: 20,
            backgroundColor: theme.colors.surface.secondary,
            fontWeight:'bold'
          }}
        />
  <Text style={{fontSize:22,fontWeight:'500', color: theme.colors.text.primary}}>{selectedItem?.label ??  SelectName+' Type'}</Text>
</View>
        <MaterialIcons
          name="arrow-forward-ios"
           size={20}
          color={theme.colors.text.primary}
          style={{
             
            margin: 5,
            borderColor: theme.colors.interactive.primary,
            borderRadius: 20,
            backgroundColor: theme.colors.surface.secondary,
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
             <Text style={{fontSize:22, color: theme.colors.text.primary}}>Select {SelectName}</Text>
             <View style={{display:'flex', gap:10}}>
{selecties.map((item, i) => (
  <TouchableOpacity onPress={()=>setSelectedFn(item.value)} key={i} style={{
    borderRadius:10,
    borderWidth:1,  paddingInline:20, height:50,  display:'flex',flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>

  <Text style={{fontSize:18, color: theme.colors.text.primary}} key={i}>{item.label}</Text>
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
export default CustomSelector;
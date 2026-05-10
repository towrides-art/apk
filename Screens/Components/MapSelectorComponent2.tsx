import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Dimensions,
  FlatList,
  TextInput,
  Image,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import Geocoder from "react-native-geocoding";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../src/theme/ThemeProvider';
import { StyledText } from "../../src/components/styled";
// Initialize Geocoder with your API Key
Geocoder.init("AIzaSyCr6FbhZa_qV3jn7bz6lr7OZYfTz5Xrpzo");

 
const MapSelectorComponent2 = ({
  selectedLocation,
  selected_drop_points,
  set_selected_drop_points,
  text,
  searchText2
  
   
}: any) => {
  const { theme } = useTheme();

    // 

 const service_providers = [
   {
     name:'Nitish Garage',
     longitude:'76.0156',
     latitude:'29.6947'
   },
   {
     name:'Naveen Garage',
     longitude:'76.01829',
     latitude:'29.69342'
   }
 ];
  
  const [suggestions, setSuggestions] = useState<any[]>([]);
 

 
  
    // 
  const [modalVisible, setModalVisible] = useState(false);
  const [tempLocation, setTempLocation] = useState(
    selected_drop_points || selectedLocation
  );
  const [moving,setMoving]=useState(false)
  
  const [searchText, setSearchText] = useState(searchText2 ?? " Enter Drop Location");
  const previewMapRef = useRef<MapView>(null);
  const modalMapRef = useRef<MapView>(null);

  const updateAddressFromCoords = async (latitude: number, longitude: number) => {
    try {
      const res = await Geocoder.from(latitude, longitude);
      const addr = res.results[0]?.formatted_address || "Unknown address";
      setSearchText(addr);
    } catch (err) {
      console.error(err);
      setSearchText("Unknown address");
    }
  };

  const handleMapPress = async (region: any) => {
    // const { latitude, longitude } = e.nativeEvent.coordinate;
    // const newLoc = { latitude, longitude };
    // setTempLocation(newLoc);
    // updateAddressFromCoords(latitude, longitude);
// 
  setTempLocation({
      latitude: region.latitude,
      longitude: region.longitude,
    });
    updateAddressFromCoords(region.latitude, region.longitude);
    setMoving(false);

// 
    
  };

  const confirmSelection = () => {
    set_selected_drop_points({...tempLocation,name:searchText});
    setModalVisible(false);

    // 👇 Update preview map location
    setTimeout(() => {
      previewMapRef.current?.animateToRegion({
        ...tempLocation,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }, 100);
  };
 
 const handleSearch = async (text: string) => {
    setSearchText(text);
    if (text.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await Geocoder.from(text);
      const results = res.results.map((item: any) => ({
        name: item.formatted_address,
        location: item.geometry.location,
      }));
      setSuggestions(results);
    } catch (err) {
     }
  };

  const selectSuggestion = (item: any) => {
    setTempLocation({
      latitude: item.location.lat,
      longitude: item.location.lng,
    });
    
    setSearchText(item.name);
    
    setSuggestions([]);
    

    if (modalMapRef.current) {
      try{ 
      modalMapRef.current.animateToRegion({
        latitude: item.location.lat,
        longitude: item.location.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
       setTimeout(() => {
    
  }, 1000);
    }finally{
      
    }
    }
  };
  useEffect(() => {
    if (modalVisible && searchText.length >= 3) {
      //handleSearch(searchText);
    }
  }, [modalVisible]);
  return (
    <>

    <TouchableOpacity
      onPress={() => {
            setTempLocation(selected_drop_points || selectedLocation);
            setModalVisible(true);
            updateAddressFromCoords(
              (selected_drop_points || selectedLocation).latitude,
              (selected_drop_points || selectedLocation).longitude
            );
          }}
    style={{
            display:'flex',
            flexDirection:'column',  
            backgroundColor: theme.colors.surface.primary,
         
     
            
          borderRadius:15,
          // padding:10,
           justifyContent:'flex-start',//paddingInline:16,
           marginBottom:10
           }}>
           <View style={{
            display:"flex",
            flexDirection:'row',
            justifyContent:'flex-start',
            alignItems:'center'
           }}>  <MaterialIcons
                      name='fmd-good'
                       size={28}
                      color="#000"
                      style={{
                         
                        margin: 5,
                        borderColor: '#000',
                        borderRadius: 20,
                        backgroundColor: '#fff',
                        fontWeight:'bold'
                      }}
                    />
                    <StyledText weight="medium" style={{fontSize:20, color: theme.colors.text.primary }}>{text}</StyledText>
                    </View>
       <View style={{
            display:"flex",
            flexDirection:'row',
            justifyContent:'flex-start', 
            alignItems:'center',
             paddingInline:16,
             marginLeft:17,
            borderLeftWidth:3,
            borderColor:'#e0e0e0'
    
           }}>
        <Text style={{fontSize:20, color: theme.colors.text.secondary }}>
          {searchText?searchText.substring(0, 25)+(searchText.length>25?'...':''):' Enter Drop Location'}
         </Text>
    
        
    
       </View>
       
    </TouchableOpacity>
       

      {/* Modal With Fullscreen Map */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={{ flex: 1 }}>
          {/* Google Places Autocomplete */}
          <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
               <TextInput
                 value={searchText}
                 onChangeText={handleSearch}
                 placeholder="Search location..."
                 style={styles.inputWithClear}
               />
               {searchText.length > 0 && (
                 <TouchableOpacity onPress={() => setSearchText('')} style={styles.clearButton}>
                   <Text style={styles.clearButtonText}>×</Text>
                 </TouchableOpacity>
               )}
             </View>
                      
                             
                             <FlatList
                             style={{backgroundColor:'#fff', borderWidth:suggestions && suggestions.length > 0 ? 1 : 0,padding:suggestions && suggestions.length > 0 ? 8 : 0}}
                               data={suggestions}
                               keyExtractor={(item, index) => index.toString()}
                               renderItem={({ item }) => (
                                 <TouchableOpacity onPress={() => selectSuggestion(item)}>
                                   <Text style={{backgroundColor:'#eee'}}>{item.name}</Text>
                                 </TouchableOpacity>
                               )}
                     ListHeaderComponent={() =>
  suggestions && suggestions.length > 0 ? (
    <View style={{ padding: 2 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Suggestions</Text>
    </View>
  ) : null
}                        />
                          
          </View>

          {/* Fullscreen Map */}
          <MapView
            ref={modalMapRef}
            provider="google"
            style={StyleSheet.absoluteFill}
            initialRegion={{
              latitude: tempLocation.latitude,
              longitude: tempLocation.longitude,
              latitudeDelta: 0.007,
              longitudeDelta: 0.007,
            }}
            // onPress={handleMapPress}
onRegionChange={() => { setMoving(true) }}
            onRegionChangeComplete={handleMapPress}
          >
{moving && (
            <Marker coordinate={tempLocation}
             title="Selected Location"
                pinColor="#4CAF50" 
            />

)}

{service_providers.map((service, index) => (
  <Marker
    key={index}
    coordinate={{
      latitude: parseFloat(service.latitude),
      longitude: parseFloat(service.longitude),
    }}
  >
    <View style={{ alignItems: 'center' }}>
      {/* Always visible title */}
      <Text style={{
        backgroundColor: 'white',
        padding: 4,
        borderRadius: 4,
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 2,
        elevation: 2
      }}>
        {service.name}
      </Text>

      {/* Material Icon: garage */}
      <MaterialIcons name="garage" size={30} color="red" />
    </View>
  </Marker>
))}


          </MapView>
<View style={styles.markerFixed}>
            <Image
              source={require('../asset/pin.png')}
              style={{ width: 48, height: 48, resizeMode: 'contain', marginBottom: -6 }}
            />
            {/* <Text style={styles.marker}>📍</Text> */}
          </View>
          {/* Bottom Actions */}
          <View style={styles.bottomBar}>
            <TouchableOpacity
              onPress={confirmSelection}
              style={styles.confirmButton}
            >
              <Text style={{ fontSize: 18, color: "#fff" }}>Confirm Location</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.cancelButton}
            >
              <Text style={{ fontSize: 16 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: 200,
    borderRadius: 20,
  },
  selectButton: {
    marginTop: -10,
    marginBottom: 5,
    backgroundColor: "#f37f21",
    width: "100%",
    padding: 13,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    position: "absolute",
    top: 40,
    left: 10,
    right: 10,
    zIndex: 10,
  },
  searchInput: {
    height: 45,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    fontSize: 16,
    elevation: 3,
  },
  bottomBar: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
    gap: 10,
  },
  confirmButton: {
    backgroundColor: "#f37f21",
    padding: 12,
    borderRadius: 10,
    width: "90%",
    alignItems: "center",
  },
  cancelButton: {
    padding: 10,
    alignItems: "center",
  },
   searchBox: {
  position: 'relative',
  justifyContent: 'center',
},
inputWithClear: {
  backgroundColor: '#fff',
  borderRadius: 10,
  padding: 10,
  paddingRight: 35, // extra space for "X" button
  marginBottom: 10,
},
clearButton: {
  position: 'absolute',
  right: 10,
  top: -1,
  zIndex: 1,
},
clearButtonText: {
  fontSize: 30,
  color: '#000',
},
 markerFixed: {
    position: 'absolute',
    top: Dimensions.get('window').height / 2 - (Dimensions.get('window').height) * 0.073 ,
    left: Dimensions.get('window').width / 2 - (Dimensions.get('window').width) * 0.05,
  },

});

export default MapSelectorComponent2;

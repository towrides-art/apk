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
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import Geocoder from "react-native-geocoding";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { useTheme } from '../../src/theme/ThemeProvider';

// Initialize Geocoder with your API Key
Geocoder.init("AIzaSyCr6FbhZa_qV3jn7bz6lr7OZYfTz5Xrpzo");

 
const DestinationSelector = ({
  selectedLocation,
  selected_drop_points,
  set_selected_drop_points,
}: any) => {
  const { theme } = useTheme();

    // 

 
  
  const [suggestions, setSuggestions] = useState<any[]>([]);
 

 
  
    // 
  const [modalVisible, setModalVisible] = useState(false);
  const [tempLocation, setTempLocation] = useState(
    selected_drop_points || selectedLocation
  );
  const [searchText, setSearchText] = useState("Current Location");
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

  const handleMapPress = async (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    const newLoc = { latitude, longitude };
    setTempLocation(newLoc);
    updateAddressFromCoords(latitude, longitude);
  };

  const confirmSelection = () => {
    set_selected_drop_points(tempLocation);
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
      handleSearch(searchText);
    }
  }, [modalVisible]);
  return (
    <>
      <View style={{ flexDirection: "column", paddingTop: 10 }}>
        <MapView
          ref={previewMapRef}
          provider="google"
          style={styles.map}
          initialRegion={{
            latitude: selected_drop_points?.latitude || selectedLocation.latitude,
            longitude: selected_drop_points?.longitude || selectedLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          scrollEnabled={false}
          zoomEnabled={false}
          pitchEnabled={false}
          rotateEnabled={false}
          toolbarEnabled={false}
        >
          <Marker
            coordinate={
              selected_drop_points?.latitude
                ? selected_drop_points
                : selectedLocation
            }
            title={"Selected Location"}
          />
        </MapView>

        <TouchableOpacity
          onPress={() => {
            setTempLocation(selected_drop_points || selectedLocation);
            setModalVisible(true);
            updateAddressFromCoords(
              (selected_drop_points || selectedLocation).latitude,
              (selected_drop_points || selectedLocation).longitude
            );
          }}
          style={[styles.selectButton, { backgroundColor: theme.colors.interactive.primary }]}
          activeOpacity={0.6}
        >
          <Text style={{ fontSize: 20, color: theme.colors.text.inverse }}>Select on Map</Text>
        </TouchableOpacity>
      </View>

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
              latitudeDelta: 0.008,
              longitudeDelta: 0.008,
            }}
            onPress={handleMapPress}
          >
            <Marker coordinate={tempLocation} />
          </MapView>

          {/* Bottom Actions */}
          <View style={styles.bottomBar}>
            <TouchableOpacity
              onPress={confirmSelection}
              style={[styles.confirmButton, { backgroundColor: theme.colors.interactive.primary }]}
            >
              <Text style={{ fontSize: 18, color: theme.colors.text.inverse }}>Confirm Location</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.cancelButton}
            >
              <Text style={{ fontSize: 16, color: theme.colors.text.primary }}>Cancel</Text>
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

});

export default DestinationSelector;

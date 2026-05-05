import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useState } from "react";
import { Dimensions, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import Modal from "react-native-modal";
import DestinationSelector from "./DestinationSelector";
import GarageSelector from "./GarageSelector";
import Slider from 'react-native-slide-to-unlock';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ServiceIcon from './ServiceIcons';
import { useTheme } from '../../src/theme/ThemeProvider';

const services = [
  {
    name: 'Vehicle Towing',
    image: require('./asset/tow.jpg'),
    whereToRequired: false,
    type: 'tow'
  },
  {
    name: 'Battery JumpStart',
    image: require('./asset/jumpstart.png'),
    whereToRequired: false,
    type: 'jumpstart'
  },
  {
    name: 'Tyre Restoration',
    image: require('./asset/tyre.webp'),
    whereToRequired: false,
    type: 'tyre'
  },
  {
    name: ' Fuel Delivery',
    image: require('./asset/fuel.png'),
    whereToRequired: false,
    type: 'fuel'
  },
];

const ServicesUnderMap = ({ navigation, selectedLocation, searchText }: any) => {
  const { theme } = useTheme();
  const [tow_model, setTowModel] = useState(false);
  const [JumpStart_model, setJumpStartModell] = useState(false);
  const [Tyre_model, setTyreModel] = useState(false);
  const [Fuel_model, setFuelModel] = useState(false);
  const openServiceModel = (type: string) => {
    if (type == 'tow') {
      setTowModel(true);
    }
    if (type == 'jumpstart') {
      setJumpStartModell(true);
    }
    if (type == 'tyre') {
      setTyreModel(true);
    }
    if (type == 'fuel') {
      setFuelModel(true);
    }
  }
  const TowModel = ({ navigation }: any) => {
    const [Vehicleopen, setVehicleOpen] = useState(false);
    const [selectedVehicle, SetselectedVehicle] = useState(null);
    const [vehicles, setVehicles] = useState([
      { label: 'Bike/Scooter', value: '1' },
      { label: 'Electric Bike', value: '2' },
      { label: 'Hatchback', value: '3' },
      { label: 'Sedan', value: '4' },
      { label: 'SUV', value: '5' },
      { label: 'Electric Car', value: '6' },
      { label: 'Pickup Truck', value: '7' },
      { label: 'Auto/E-Rickshaw', value: '8' },
      { label: 'Mini Truck', value: '9' },
      { label: 'Bus/School Van', value: '10' },
      { label: 'Tractor/Trolley', value: '11' },
      { label: 'Luxury Car', value: '12' },
      { label: 'JCB/Construction', value: '13' },
    ]);
    const [tow_open, setTowOpen] = useState(false);
    const [selected_tow_type, SetselectedTowType] = useState(null);
    const [selected_where_to, setSelectedWhereTo] = useState('my_destination')
    const [other_details, set_other_details] = useState('')
    const [selected_drop_points, set_selected_drop_points] = useState(null)
    const [tow_types, setTowTypes] = useState([
      { label: 'Flatbed', value: '1' },
      { label: 'Mini Flatbed', value: '2' },
      { label: 'Heavy Duty Flatbed', value: '3' },
      { label: 'Wheel-lift', value: '4' },
      { label: 'Boom or Heavy Duty Tow Truck', value: '5' },
      { label: 'Rotato', value: '6' },
    ]);

    const [renderTowContent, setRenderTowContent] = useState(false);

    useEffect(() => {
      if (tow_model) {
        setTimeout(() => {
          setRenderTowContent(true);
        }, 50); // Delay just enough to avoid flicker
      } else {
        setRenderTowContent(false);
      }
    }, [tow_model]);

    // 
    const [isTowSliding, setIsTowSliding] = useState(false);

    const handleTowSlide = () => {
      if (!isTowSliding) {
        setIsTowSliding(true);

        // optional: add a delay or animation before navigation
        setTimeout(() => {
          navigation.navigate('SearchingProvider');
        }, 300);
      }
    };
    // 
    return (
      <Modal
        isVisible={tow_model}
        onBackdropPress={() => setTowModel(false)}
        style={{ justifyContent: 'flex-end', margin: 0 }}
        onBackButtonPress={() => setTowModel(false)}
      >
        {renderTowContent ? (
          <>

            <View style={{
              height: Dimensions.get('window').height * 0.8,

              backgroundColor: theme.colors.surface.primary,
              padding: 20,
              borderTopRightRadius: 25,
              borderTopLeftRadius: 25,

            }} >

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 30 }}
              >
                <Text style={{ fontSize: 22, color: theme.colors.text.primary }}>Vehicle Towing</Text>
                <View style={styles.searchBox}>
                  <Text style={{ fontWeight: '500', marginBottom: 5, color: theme.colors.text.primary }}>Current Location</Text>
                  <TextInput
                    value={searchText}
                    readOnly={true}

                    placeholder="Search location..."
                    style={styles.inputWithClear}
                  />

                </View>
                <View style={styles.searchBox}>
                  <Text style={{ fontWeight: 500, marginBottom: 5 }}>Vehicle Type</Text>
                  <DropDownPicker
                    style={{ zIndex: Vehicleopen ? 1000 : 1 }}
                    open={Vehicleopen}
                    value={selectedVehicle}
                    items={vehicles}
                    setOpen={setVehicleOpen}
                    setValue={SetselectedVehicle}
                    setItems={setVehicles}
                    placeholder="Select Vehicle Type"
                  />

                </View>
                <View style={styles.searchBox}>
                  <Text style={{ fontWeight: 500, marginBottom: 5 }}>Tow Type</Text>
                  <DropDownPicker
                    style={{ zIndex: tow_open ? 1000 : 1 }}
                    open={tow_open}
                    value={selected_tow_type}
                    items={tow_types}
                    setOpen={setTowOpen}
                    setValue={SetselectedTowType}
                    setItems={setTowTypes}
                    placeholder="Select Tow Type"
                  />
                </View>
                <View style={styles.searchBox}>
                  <Text style={{ fontWeight: 500, marginBottom: 5 }}>Other Details (Optional)</Text>
                  <TextInput

                    value={other_details}
                    onChange={(txt) => set_other_details(txt)}
                    placeholder="e.g. car model or any specific"
                    style={{
                      borderWidth: 1,
                      borderRadius: 10,
                      padding: 10,
                      paddingRight: 35,
                      marginBottom: 10,
                    }}
                  />

                </View>
                <View style={styles.searchBox}>
                  <Text style={{ fontWeight: 500, marginBottom: 5 }}>Where To?</Text>
                  <View
                    style={[
                      {
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                      },

                    ]}
                  >
                    <TouchableOpacity onPress={() => setSelectedWhereTo('my_destination')}

                      style={[styles.where_to_items,

                      {
                        backgroundColor: selected_where_to === 'my_destination' ? '#f37f21' : '#fff',
                      },
                      ]}>
                      <Text style={{ color: selected_where_to === 'my_destination' ? '#fff' : '#000' }}>My Destination</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setSelectedWhereTo('nearby_garage')}
                      style={[styles.where_to_items,
                      {
                        backgroundColor: selected_where_to === 'nearby_garage' ? '#f37f21' : '#fff',

                      },

                      ]}>
                      <Text style={{ color: selected_where_to === 'nearby_garage' ? '#fff' : '#000' }}>Nearby Garage</Text>
                    </TouchableOpacity>


                  </View>
                </View>
                {selected_where_to == 'my_destination' ? (
                  <>
                    <DestinationSelector selectedLocation={selectedLocation} selected_drop_points={selected_drop_points} set_selected_drop_points={set_selected_drop_points} />
                  </>
                ) : (<>
                  <GarageSelector selectedLocation={selectedLocation} selected_drop_points={selected_drop_points} set_selected_drop_points={set_selected_drop_points} />
                </>
                )}
              </ScrollView>
            </View>


          </>
        ) : (
          <>

          </>
        )}
        <View style={{ backgroundColor: '#fff' }}>
          <Slider
            disableReset={isTowSliding} // if using a custom slider that supports this
            childrenContainer={{
              backgroundColor: '#fff',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
            }}
            onEndReached={handleTowSlide}
            containerStyle={{
              margin: 8,
              backgroundColor: '#fff',
              borderRadius: 10,
              overflow: 'hidden',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
            }}
            sliderElement={
              <MaterialIcons
                name="arrow-forward"
                size={40}
                color="#f37f21"
                style={{
                  borderWidth: 4,
                  margin: 5,
                  borderColor: '#f37f21',
                  borderRadius: 20,
                  backgroundColor: '#fff',
                }}
              />
            }
          >
            <Text style={{ fontSize: 22 }}>{isTowSliding ? 'Please wait...' : 'SLIDE TO BOOK'}</Text>
          </Slider>
        </View>

      </Modal>
    )
  }
  const JumpStartModel = () => {
    const [renderJumpStartContent, setRenderJumpStartContent] = useState(false);
    const [other_details, set_other_details] = useState('')
    const [Vehicleopen, setVehicleOpen] = useState(false);
    const [selectedVehicle, SetselectedVehicle] = useState(null);
    const [vehicles, setVehicles] = useState([
      { label: 'Bike/Scooter', value: '1' },
      { label: 'Electric Bike', value: '2' },
      { label: 'Hatchback', value: '3' },
      { label: 'Sedan', value: '4' },
      { label: 'SUV', value: '5' },
      { label: 'Electric Car', value: '6' },
      { label: 'Pickup Truck', value: '7' },
      { label: 'Auto/E-Rickshaw', value: '8' },
      { label: 'Mini Truck', value: '9' },
      { label: 'Bus/School Van', value: '10' },
      { label: 'Tractor/Trolley', value: '11' },
      { label: 'Luxury Car', value: '12' },
      { label: 'JCB/Construction', value: '13' },
    ]);
    useEffect(() => {
      if (JumpStart_model) {
        setTimeout(() => {
          setRenderJumpStartContent(true);
        }, 50); // Delay just enough to avoid flicker
      } else {
        setRenderJumpStartContent(false);
      }
    }, [JumpStart_model]);

    const [isSliding, setIsSliding] = useState(false);

    const handleTowSlide = () => {
      if (!isSliding) {
        setIsSliding(true);

        // optional: add a delay or animation before navigation
        setTimeout(() => {
          navigation.navigate('SearchingProvider');
        }, 300);
      }
    };
    return (
      <Modal
        isVisible={JumpStart_model}
        onBackdropPress={() => setJumpStartModell(false)}
        style={{ justifyContent: 'flex-end', margin: 0 }}
      >
        {renderJumpStartContent ? (
          <>
            <View style={{

              backgroundColor: '#fff',
              padding: 20,
              borderTopRightRadius: 25,
              borderTopLeftRadius: 25,

            }} >

              <Text style={{ fontSize: 22 }}>Battery JumpStart</Text>
              <View style={styles.searchBox}>
                <Text style={{ fontWeight: 500, marginBottom: 5 }}>Current Location</Text>
                <TextInput
                  value={searchText}
                  readOnly={true}

                  placeholder="Search location..."
                  style={styles.inputWithClear}
                />

              </View>
              <View style={styles.searchBox}>
                <Text style={{ fontWeight: 500, marginBottom: 5 }}>Vehicle Type</Text>
                <DropDownPicker
                  style={{ zIndex: Vehicleopen ? 1000 : 1 }}
                  open={Vehicleopen}
                  value={selectedVehicle}
                  items={vehicles}
                  setOpen={setVehicleOpen}
                  setValue={SetselectedVehicle}
                  setItems={setVehicles}
                  placeholder="Select Vehicle Type"
                />

              </View>
              <View style={styles.searchBox}>
                <Text style={{ fontWeight: 500, marginBottom: 5 }}>Other Details (Optional)</Text>
                <TextInput

                  value={other_details}
                  onChange={(txt) => set_other_details(txt)}
                  placeholder="e.g. car model or any specific"
                  style={{
                    borderWidth: 1,
                    borderRadius: 10,
                    padding: 10,
                    paddingRight: 35,
                    marginBottom: 10,
                  }}
                />

              </View>

            </View>
            <View style={{ backgroundColor: '#fff' }}>
              <Slider
                disableReset={isSliding} // if using a custom slider that supports this
                childrenContainer={{
                  backgroundColor: '#fff',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 1,
                }}
                onEndReached={handleTowSlide}
                containerStyle={{
                  margin: 8,
                  backgroundColor: '#fff',
                  borderRadius: 10,
                  overflow: 'hidden',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                }}
                sliderElement={
                  <MaterialIcons
                    name="arrow-forward"
                    size={40}
                    color="#f37f21"
                    style={{
                      borderWidth: 4,
                      margin: 5,
                      borderColor: '#f37f21',
                      borderRadius: 20,
                      backgroundColor: '#fff',
                    }}
                  />
                }
              >
                <Text style={{ fontSize: 22 }}>{isSliding ? 'Please wait...' : 'SLIDE TO BOOK'}</Text>
              </Slider>
            </View>
          </>) : null}


      </Modal>
    )
  }
  const TyreModel = () => {
    const [renderContent, setrenderContent] = useState(false);
    const [other_details, set_other_details] = useState('');
    const [no_of_tyres, set_no_of_tyres] = useState('1');


    const [Vehicleopen, setVehicleOpen] = useState(false);
    const [selectedVehicle, SetselectedVehicle] = useState(null);
    const [vehicles, setVehicles] = useState([
      { label: 'Bike/Scooter', value: '1' },
      { label: 'Electric Bike', value: '2' },
      { label: 'Hatchback', value: '3' },
      { label: 'Sedan', value: '4' },
      { label: 'SUV', value: '5' },
      { label: 'Electric Car', value: '6' },
      { label: 'Pickup Truck', value: '7' },
      { label: 'Auto/E-Rickshaw', value: '8' },
      { label: 'Mini Truck', value: '9' },
      { label: 'Bus/School Van', value: '10' },
      { label: 'Tractor/Trolley', value: '11' },
      { label: 'Luxury Car', value: '12' },
      { label: 'JCB/Construction', value: '13' },
    ]);
    useEffect(() => {
      if (Tyre_model) {
        setTimeout(() => {
          setrenderContent(true);
        }, 50); // Delay just enough to avoid flicker
      } else {
        setrenderContent(false);
      }
    }, [Tyre_model]);

    const [isSliding, setIsSliding] = useState(false);

    const handleTowSlide = () => {
      if (!isSliding) {
        setIsSliding(true);

        // optional: add a delay or animation before navigation
        setTimeout(() => {
          navigation.navigate('SearchingProvider');
        }, 300);
      }
    };
    const [puncher_or_change, set_puncher_or_change] = useState('puncher');
    return (
      <Modal
        isVisible={Tyre_model}
        onBackdropPress={() => setTyreModel(false)}
        style={{ justifyContent: 'flex-end', margin: 0 }}
      >

        {renderContent ? (
          <>
            <View style={{

              backgroundColor: '#fff',
              padding: 20,
              borderTopRightRadius: 25,
              borderTopLeftRadius: 25,

            }} >

              <Text style={{ fontSize: 22 }}>Tyre Restoration</Text>
              <View style={styles.searchBox}>
                <Text style={{ fontWeight: 500, marginBottom: 5 }}>Current Location</Text>
                <TextInput
                  value={searchText}
                  readOnly={true}

                  placeholder="Search location..."
                  style={styles.inputWithClear}
                />

              </View>
              <View style={styles.searchBox}>
                <Text style={{ fontWeight: 500, marginBottom: 5 }}>Vehicle Type</Text>
                <DropDownPicker
                  style={{ zIndex: Vehicleopen ? 1000 : 1 }}
                  open={Vehicleopen}
                  value={selectedVehicle}
                  items={vehicles}
                  setOpen={setVehicleOpen}
                  setValue={SetselectedVehicle}
                  setItems={setVehicles}
                  placeholder="Select Vehicle Type"
                />

              </View>
              <View style={styles.searchBox}>
                <Text style={{ fontWeight: 500, marginBottom: 5 }}>Other Details (Optional)</Text>
                <TextInput

                  value={other_details}
                  onChange={(txt) => set_other_details(txt)}
                  placeholder="e.g. car model or any specific"
                  style={{
                    borderWidth: 1,
                    borderRadius: 10,
                    padding: 10,
                    paddingRight: 35,
                    marginBottom: 10,
                  }}
                />

              </View>

              <View style={styles.searchBox}>
                <Text style={{ fontWeight: 500, marginBottom: 5 }}>Select Service.. </Text>
                <View
                  style={[
                    {
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'space-around',
                    },

                  ]}
                >
                  <TouchableOpacity onPress={() => set_puncher_or_change('puncher')}

                    style={[styles.where_to_items,

                    {
                      backgroundColor: puncher_or_change === 'puncher' ? '#f37f21' : '#fff',
                    },
                    ]}>
                    <Text style={{ color: puncher_or_change === 'puncher' ? '#fff' : '#000' }}>Puncher</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => set_puncher_or_change('change')}
                    style={[styles.where_to_items,
                    {
                      backgroundColor: puncher_or_change === 'change' ? '#f37f21' : '#fff',

                    },

                    ]}>
                    <Text style={{ color: puncher_or_change === 'change' ? '#fff' : '#000' }}>Change Tyre(s)</Text>
                  </TouchableOpacity>


                </View>
                {puncher_or_change == 'change' ? (
                  <>
                    <View style={styles.searchBox}>
                      <Text style={{ fontWeight: 500, marginBottom: 5 }}>How Many Tyres</Text>
                      <TextInput
                        keyboardType="numeric"
                        value={no_of_tyres}
                        onChangeText={(txt) => {
                          // Allow only numbers
                          const numericText = txt.replace(/[^0-9]/g, '');
                          set_no_of_tyres(numericText);
                        }}
                        placeholder="No. of tyres"
                        style={{
                          borderWidth: 1,
                          borderRadius: 10,
                          padding: 10,
                          paddingRight: 35,
                          marginBottom: 10,
                        }}
                      />

                    </View>
                  </>
                ) : null}
              </View>
            </View>



            <View style={{ backgroundColor: '#fff' }}>
              <Slider
                disableReset={isSliding} // if using a custom slider that supports this
                childrenContainer={{
                  backgroundColor: '#fff',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 1,
                }}
                onEndReached={handleTowSlide}
                containerStyle={{
                  margin: 8,
                  backgroundColor: '#fff',
                  borderRadius: 10,
                  overflow: 'hidden',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                }}
                sliderElement={
                  <MaterialIcons
                    name="arrow-forward"
                    size={40}
                    color="#f37f21"
                    style={{
                      borderWidth: 4,
                      margin: 5,
                      borderColor: '#f37f21',
                      borderRadius: 20,
                      backgroundColor: '#fff',
                    }}
                  />
                }
              >
                <Text style={{ fontSize: 22 }}>{isSliding ? 'Please wait...' : 'SLIDE TO BOOK'}</Text>
              </Slider>
            </View>
          </>) : null}

      </Modal>
    )
  }
  const FuelModel = () => {
    const [renderContent, setrenderContent] = useState(false);
    const [Fuelopen, setFuelOpen] = useState(false);
    const [selectedFuel, setSelectedFuel] = useState(null);
    const [litreOption, setLitreOption] = useState('5');
    const [otherLitre, setOtherLitre] = useState('');
    const [isSliding, setIsSliding] = useState(false);

    const fuelTypes = [
      { label: 'Petrol', value: 'petrol' },
      { label: 'Diesel', value: 'diesel' },
      { label: 'CNG Gas', value: 'cng' },
    ];

    useEffect(() => {
      if (Fuel_model) {
        setTimeout(() => {
          setrenderContent(true);
        }, 50);
      } else {
        setrenderContent(false);
      }
    }, [Fuel_model]);

    const handleFuelSlide = () => {
      if (!isSliding) {
        setIsSliding(true);
        setTimeout(() => {
          navigation.navigate('SearchingProvider');
        }, 300);
      }
    };

    return (
      <Modal
        isVisible={Fuel_model}
        onBackdropPress={() => setFuelModel(false)}
        style={{ justifyContent: 'flex-end', margin: 0 }}
      >
        {renderContent ? (
          <>
            <View
              style={{
                backgroundColor: '#fff',
                padding: 20,
                borderTopRightRadius: 25,
                borderTopLeftRadius: 25,
              }}
            >
              <Text style={{ fontSize: 22 }}>Fuel Delivery</Text>

              <View style={styles.searchBox}>
                <Text style={{ fontWeight: 500, marginBottom: 5 }}>Fuel Type</Text>
                <DropDownPicker
                  style={{ zIndex: Fuelopen ? 1000 : 1 }}
                  open={Fuelopen}
                  value={selectedFuel}
                  items={fuelTypes}
                  setOpen={setFuelOpen}
                  setValue={setSelectedFuel}
                  placeholder="Select Fuel Type"
                />
              </View>

              <View style={styles.searchBox}>
                <Text style={{ fontWeight: 500, marginBottom: 5 }}>How Many Litres?</Text>
                <View style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  gap: 10,
                  marginBottom: 10
                }}>
                  {['5', '10', '15', 'other'].map((val) => (
                    <TouchableOpacity
                      key={val}
                      onPress={() => setLitreOption(val)}
                      style={{
                        width: '48%',
                        marginBottom: 10,
                        padding: 12,
                        alignItems: 'center',
                        borderRadius: 10,
                        backgroundColor: litreOption === val ? '#f37f21' : '#fff',
                        borderWidth: 1,
                        borderColor: '#ccc',
                      }}
                    >
                      <Text style={{ color: litreOption === val ? '#fff' : '#000' }}>
                        {val === 'other' ? 'Other' : `${val} Litre`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>


                {litreOption === 'other' && (
                  <TextInput
                    keyboardType="numeric"
                    value={otherLitre}
                    onChangeText={(txt) => setOtherLitre(txt.replace(/[^0-9]/g, ''))}
                    placeholder="Enter amount in litres"
                    style={{
                      borderWidth: 1,
                      borderRadius: 10,
                      padding: 10,
                      paddingRight: 35,
                      marginBottom: 10,
                    }}
                  />
                )}
              </View>
            </View>

            <View style={{ backgroundColor: '#fff' }}>
              <Slider
                disableReset={isSliding}
                childrenContainer={{
                  backgroundColor: '#fff',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 1,
                }}
                onEndReached={handleFuelSlide}
                containerStyle={{
                  margin: 8,
                  backgroundColor: '#fff',
                  borderRadius: 10,
                  overflow: 'hidden',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                }}
                sliderElement={
                  <MaterialIcons
                    name="arrow-forward"
                    size={40}
                    color="#f37f21"
                    style={{
                      borderWidth: 4,
                      margin: 5,
                      borderColor: '#f37f21',
                      borderRadius: 20,
                      backgroundColor: '#fff',
                    }}
                  />
                }
              >
                <Text style={{ fontSize: 22 }}>{isSliding ? 'Please wait...' : 'SLIDE TO BOOK'}</Text>
              </Slider>
            </View>
          </>
        ) : null}
      </Modal>
    );
  };

  return (
    <>
      <View style={[styles.maincontainer, { backgroundColor: theme.colors.surface.primary }]}>
        <TowModel navigation={navigation} />
        <JumpStartModel />
        <TyreModel />
        <FuelModel />
        <View style={styles.headerSection}>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>Select Service</Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.text.secondary }]}>Choose the service you need</Text>
        </View>
        <View style={styles.services}>
          {services.map((service, index) => {
            return (
              <TouchableOpacity 
                key={index} 
                style={styles.ServiceItem} 
                activeOpacity={0.7} 
                onPress={() => openServiceModel(service.type)}
              >
                <View style={styles.iconContainer}>
                  <ServiceIcon type={service.type as 'tow' | 'jumpstart' | 'tyre' | 'fuel'} size={50} color="#f37f21" />
                </View>
                <Text style={[styles.serviceText, { color: theme.colors.text.primary }]}>{service.name}</Text>
                <View style={styles.serviceBadge}>
                  <MaterialIcons name="arrow-forward" size={16} color={theme.colors.interactive.primary} />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </>
  );

}

const styles = StyleSheet.create({
  maincontainer: {
    display: 'flex',
    width: '100%',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    // height:Dimensions.get('window').height*0.22,
    left: 0,
    position: 'absolute',
    bottom: 0,
    elevation: 20
    ,
    paddingBottom: 20


  },
  services: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',

  },
  ServiceItem: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    width: (100 / services.length) - 10,

  },
  serviceImage: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
    marginBottom: 5,
  },
  serviceText: {
    textAlign: 'center'
  },
  searchBox: {
    position: 'relative',
    justifyContent: 'center',
    paddingTop: 10
  },
  inputWithClear: {
    backgroundColor: '#eee',
    borderRadius: 10,
    padding: 10,
    paddingRight: 35, // extra space for "X" button
    marginBottom: 10,
  },
  where_to_items: {
    width: '45%',
    alignItems: 'center',
    borderWidth: 1,
    padding: 5,
    borderRadius: 16,
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
  },
  services: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  ServiceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#f37f21',
  },
  serviceText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  serviceBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f37f21',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
export default ServicesUnderMap;
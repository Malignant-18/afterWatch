import { fetchTraktData } from 'api/traktAuth';
import NotificationBar from 'components/notificationBar';
import React, { useState } from 'react';
import { Button, Text, View } from 'react-native';

const Home = () => {
  const [data, setData] = useState<string>('nil');
  const fetchdata = async () => {
    try {
      const moviedetails = await fetchTraktData('/sync/history');
      //const det = JSON.stringify(moviedetails);
      setData(moviedetails);

      const m1 = {
        episode: moviedetails[0].episode.number,
        title: moviedetails[0].episode.title,
        season: moviedetails[0].episode.season,
      };
      console.log('s                f                          c');
      console.log(moviedetails);
      console.log('s                f                          c');
      console.log(JSON.stringify(m1));
    } catch (error) {
      console.log('error ocucred in try : ', error);
    }
  };
  return (
    <>
      <View className="justify-along flex-row">
        <Text>AFTERWATCH</Text>
        <NotificationBar />
      </View>
      <View>
        <Text>HEY we aare in h9meeee login succesfgul oauthinte andiiii</Text>
        <Button onPress={() => fetchdata()} title="fetchsample" />
        <Text>{data === 'nil' ? 'no data fetched' : data.toString()}</Text>
      </View>
    </>
  );
};

export default Home;

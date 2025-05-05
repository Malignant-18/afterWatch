import { fetchHistorySync, fetchRatingSync } from 'api/traktSync';
import NotificationBar from 'components/notificationBar';
import { deleteDB, initDatabase, resetDatabase } from 'db/dbinit';
import { TraktHistoryItem } from 'interfaces/interface_history';
import { TraktRatingItem } from 'interfaces/interface_rating';
import React, { useEffect, useState } from 'react';
import { Button, Text, View } from 'react-native';

const Home = () => {
  const [data, setData] = useState<TraktHistoryItem[] | null>(null);
  const [rating, setRating] = useState<TraktRatingItem[] | null>(null);
  const [load, setLoad] = useState<boolean>(false);
  useEffect(() => {
    const initDatabaseAtFirstLoad = async () => {
      try {
        await initDatabase();
      } finally {
        setLoad(true);
      }
    };
    initDatabaseAtFirstLoad();
  }, []);
  const fetchdata = async () => {
    try {
      const moviedetails = await fetchHistorySync();

      //const det = JSON.stringify(moviedetails);
      setData(moviedetails);
      const m1 = {
        episode: moviedetails?.[0].watched_at,
        slugg:
          moviedetails?.[0].type === 'movie'
            ? moviedetails?.[0].movie.ids.slug
            : moviedetails?.[0].show.ids.slug,
      };
      console.log('s                f                          c');
      console.log(moviedetails);
      console.log('s                f                          c');
      console.log(JSON.stringify(m1));
    } catch (error) {
      console.log('error ocucred in try : ', error);
    }
  };

  //rating
  const fetchrating = async () => {
    try {
      const movieratings = await fetchRatingSync();

      //const det = JSON.stringify(moviedetails);
      setRating(movieratings);
      const m1 = {
        slugg: movieratings?.[0].rating.toString(),
      };
      console.log('s          ratingggg      f                          c');
      console.log(movieratings);
      console.log('s                f                          c');
      console.log(JSON.stringify(m1));
    } catch (error) {
      console.log('error ocucred in try : ', error);
    }
  };

  const deleteDBRows = async () => {
    await deleteDB();
  };
  return (
    <>
      <View className="justify-along flex-row">
        <Text>AFTERWATCH</Text>
        <Text>{load ? 'load - true db init ok' : 'load -false db init failed'}</Text>
        <NotificationBar />
      </View>
      <View>
        <Text>HEY we aare in h9meeee login succesfgul oauthinte andiiii</Text>
        <Button onPress={() => fetchdata()} title="fetchsample" />
        <Text>{data === null ? 'no data fetched' : data.toString()}</Text>
        <Button title="click to delete/reset db" onPress={() => deleteDBRows()} />
        <Text>gap gap pga</Text>
        <Button onPress={() => fetchrating()} title="fetchrating" />
        <Text>{rating === null ? 'no data fetched' : rating.toString()}</Text>
        <Button title="click to drop tabel wholly" onPress={() => resetDatabase()} />
      </View>
    </>
  );
};

export default Home;

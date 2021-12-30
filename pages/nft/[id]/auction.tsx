import { HStack, VStack } from "@chakra-ui/layout";
import { useToast } from '@chakra-ui/react'
import React, {useEffect, useState} from "react";
import {withRouter} from 'next/router';
import Head from "next/head";
import Link from "next/link";
import { BigNumber } from "ethers";
import { Image } from "@chakra-ui/image";
import styles from "./auction.module.css";
import {shortenHash, timezone, getParams} from '../../../utils/helpers';
import {getSubgraphData, getSubgraphAuction } from '../../../utils/graphQueries';
import { createObject } from "utils/nftHelpers";
import Countdown,{zeroPad} from 'react-countdown';
import { utils } from "ethers";
import { participateAuction } from "utils/contractCalls";
import { useWeb3Context } from "@/contexts/Web3Context";
import { createListedAuction } from "utils/nftHelpers";
import { introspectionFromSchema } from "graphql";
import Custom404 from "../../404";
function AuctionNFTView({router}) {

  const { account, provider, marketAddress, factoryAddress } = useWeb3Context();
  const [index, setIndex] = useState();
  const [nftObject, setNftObject] = useState(null);
  const [contribute,setContribute] = useState(0);
  const [error,setError] = useState(false);
  const toast = useToast();


  const handleContribute = async () => {
    if(contribute==0){
      toast({
        title: 'No ETH contributed',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
      return;
    }
    const {tokenAddress,seller,sellerNonce} = nftObject;
    const weiVal = utils.parseUnits(contribute.toString());
    try {
      const tx = await participateAuction(tokenAddress,seller,sellerNonce,weiVal,provider,marketAddress)
      .then((e)=>console.log(e)
      );
      toast({
        title: `Contributed ${contribute.toString()} ETH` ,
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
    } catch (error) {
      console.log(error);
      
    }
    
    
    

  }

  const handleContributeChange = (e)=>{
    const val = e.target.value;
    setContribute(val);
  }

  useEffect(() => {
  }, )

  useEffect(async ()=>{
      if(!router.isReady) return;
      
      // const address = getParams('nft');
      // const index = address.split('/auction')[0]
      const index = router.query.id;
      
      if(index){
        setIndex(index)
      }
      let obj = await getSubgraphAuction('singleAuction',index);
      if(obj?.auction==null){
        setError(true);
        return;
      }
      
      let _hash = await getSubgraphAuction("auctionsNFT",obj.auction.tokenAddress);
      Object.assign(obj,{
        "hash":_hash.fraktalNFT.hash,
      });
      const item = await createListedAuction(obj);
      Object.assign(obj.auction,{
        "hash":_hash.fraktalNFT.hash,
        "name":item.name,
        "imageURL":item.imageURL
      });
      
      
      if(obj){
        setNftObject(obj.auction);
      }
  },[router.isReady])
  const exampleNFT = {
    id: 0,
    name: "Golden Fries Cascade",
    imageURL: "filler-image-1.png",
    artistAddress: "0x1234...5678",
    contributions: BigNumber.from(5).div(100),
    createdAt: new Date().toISOString(),
    countdown: new Date("06-25-2021"),
  };
  
  const renderer = ({ days, hours, minutes, seconds, completed })=>{
    if (completed) {
      // Render a completed state
      return <div>Ended</div>;
    } else {
      // Render a countdown
      if(days>0){
        return <div style={{ marginRight: "52px"}}>
        <div className={styles.auctionCardHeader}>Time Remaining</div>
          <div className={styles.auctionCardDetailsContainer}>
            <div style={{ marginRight: "48px" }}>
              <div className={styles.auctionCardDetailsNumber}>{zeroPad(days)}</div>
              <div className={styles.auctionCardDetailsText}>Days</div>
            </div>
            <div style={{ marginRight: "28px" }}>
              <div className={styles.auctionCardDetailsNumber}>{zeroPad(hours)}</div>
              <div className={styles.auctionCardDetailsText}>Hours</div>
            </div>
            <div>
              <div className={styles.auctionCardDetailsNumber}>{zeroPad(minutes)}</div>
              <div className={styles.auctionCardDetailsText}>Minutes</div>
            </div>
          </div>
        </div>;
      }
      else{
        return (
        <div style={{ marginRight: "52px" }}>
        <div className={styles.auctionCardHeader}>Time Remaining</div>
          <div className={styles.auctionCardDetailsContainer}>
            <div style={{ marginRight: "48px" }}>
              <div className={styles.auctionCardDetailsNumber}>{zeroPad(hours)}</div>
              <div className={styles.auctionCardDetailsText}>Hours</div>
            </div>
            <div style={{ marginRight: "28px" }}>
              <div className={styles.auctionCardDetailsNumber}>{zeroPad(minutes)}</div>
              <div className={styles.auctionCardDetailsText}>Minutes</div>
            </div>
            <div>
              <div className={styles.auctionCardDetailsNumber}>{zeroPad(seconds)}</div>
              <div className={styles.auctionCardDetailsText}>Seconds</div>
            </div>
          </div>
        </div>
        );
      }
    }
  }

  if(error==true){
    return <Custom404/>
  }else{

  return (
    <VStack spacing="0" mb="12.8rem">
      <Head>
        <title>Fraktal - NFT</title>
      </Head>
      <div>
        <Link href="/">
          <div className={styles.goBack}>← back to all NFTS</div>
        </Link>

        <div className={styles.header}>{nftObject?nftObject.name:''}</div>
        <VStack spacing="32px" marginTop="40px" align="flex-center">
          <div>
              <Image
              src={nftObject?nftObject.imageURL:exampleNFT.imageURL}
              w="100%"
              h="100%"
              style={{ borderRadius: "4px 4px 0px 0px" }}
              />
            <div className={styles.NFTCard}>
              <div className={styles.cardHeader}>ARTIST</div>
              <div className={styles.cardText} style={{ color: "#985cff" }}>
                {nftObject? shortenHash(nftObject.creator) : 'loading'}
              </div>
              <div style={{ marginTop: "8px" }} className={styles.cardHeader}>
                DATE OF CREATION
              </div>
              <div className={styles.cardText}>
                {nftObject?timezone(nftObject.createdAt):'loading'}
              </div>
              <div style={{ marginTop: "8px" }} className={styles.cardHeader}>
                RESERVE PRICE
              </div>
              <div className={styles.cardText}>
                {nftObject?`${utils.formatUnits(nftObject.reservePrice)} ETH`:'loading'}
              </div>
              <div style={{ marginTop: "8px" }} className={styles.cardHeader}>
                Fraktion Amount
              </div>
              <div className={styles.cardText}>
                {nftObject?`${utils.formatUnits(nftObject.amountOfShare)}/10000 FRAK`:'loading'}
              </div>
            </div>
          </div>
          {nftObject&&<div className={styles.auctionCard}>
            <div style={{ marginRight: "52px" }}>
            <Countdown renderer={renderer} date={Number(nftObject.endTime)*1000} autoStart
                />
                </div>
            <div className={styles.auctionCardDivider} />
            <div style={{ marginRight: "24px" }}>
              <div className={styles.auctionCardHeader}>Contributed</div>
              <div className={styles.auctionCardDetailsContainer}>
                <div style={{ marginRight: "60px" }}>
                  <div className={styles.auctionCardDetailsNumber}>125.25</div>
                  <div className={styles.auctionCardDetailsText}>ETH</div>
                </div>
                <div>
                  <div className={styles.auctionCardDetailsNumber}>45</div>
                  <div className={styles.auctionCardDetailsText}>People</div>
                </div>
              </div>
            </div>
            <div className={styles.contributeContainer}>
              <div style={{ marginLeft: "24px" }}>
                <div className={styles.contributeHeader}>ETH</div>
                <input
                  className={styles.contributeInput}
                  type="number"
                  placeholder={"0.01"}
                  onChange={handleContributeChange}
                />
              </div>
              <button className={styles.contributeCTA} onClick={handleContribute}
              >Contribute</button>
            </div>
          </div>}
        </VStack>

      </div>
    </VStack>
  );
  }
}

export default withRouter(AuctionNFTView)
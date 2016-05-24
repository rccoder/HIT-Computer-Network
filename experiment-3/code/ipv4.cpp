/*
* THIS FILE IS FOR IP TEST
*/
// system support
#include "sysInclude.h"

extern void ip_DiscardPkt(char* pBuffer,int type);

extern void ip_SendtoLower(char*pBuffer,int length);

extern void ip_SendtoUp(char *pBuffer,int length);

extern unsigned int getIpv4Address();

// implemented by students

struct Ipv4
{
  char version_ihl;
  char type_of_service;
  short total_length;
  short identification;
  short fragment_offset;
  char time_to_live;
  char protocol;
  short header_checksum;
  unsigned int source_address;
  unsigned int destination_address;
  Ipv4() {
    memset(this,0,sizeof(Ipv4));
  }
  Ipv4(unsigned int len,unsigned int srcAddr,unsigned int dstAddr,
    byte _protocol,byte ttl) {
    memset(this,0,sizeof(Ipv4));
    version_ihl = 0x45;
    total_length = htons(len+20);
    time_to_live = ttl;
    protocol = _protocol;
    source_address = htonl(srcAddr);
    destination_address = htonl(dstAddr);
    
    char *pBuffer;
    memcpy(pBuffer,this,sizeof(Ipv4));
    int sum = 0;
    for(int i = 0; i < 10; i++) {
        if(i != 5) {
          sum += (int)((unsigned char)pBuffer[i*2] << 8);
          sum += (int)((unsigned char)pBuffer[i*2+1]);
        }
    }
    while((sum & 0xffff0000) != 0) {
      sum = (sum & 0xffff) + ((sum >> 16) & 0xffff);
    }
    unsigned short int ssum = sum;
    header_checksum = htons(~ssum);
  }
};

int stud_ip_recv(char *pBuffer,unsigned short length)
{
  Ipv4 *ipv4 = new Ipv4();
  *ipv4 = *(Ipv4*)pBuffer;
  int version = 0xf & ((ipv4->version_ihl)>> 4);
  if(version != 4)  {
    ip_DiscardPkt(pBuffer,STUD_IP_TEST_VERSION_ERROR);
    return 1;
  }
  int ihl = 0xf & ipv4->version_ihl;
  if(ihl < 5) {
    ip_DiscardPkt(pBuffer,STUD_IP_TEST_HEADLEN_ERROR);
    return 1;
  }
  int ttl = (int)ipv4->time_to_live;
  if(ttl == 0) {
    ip_DiscardPkt(pBuffer,STUD_IP_TEST_TTL_ERROR);
    return 1;
  }
  int destination_address = ntohl(ipv4->destination_address);  
  if(destination_address != getIpv4Address() && destination_address != 0xffffffff) {
    ip_DiscardPkt(pBuffer,STUD_IP_TEST_DESTINATION_ERROR);
    return 1;
  }
  int header_checksum = ntohs(ipv4->header_checksum);
  int sum = 0;
  for(int i = 0; i < ihl*2; i++) {
    if(i!=5)
    {
      sum += (int)((unsigned char)pBuffer[i*2] << 8);
      sum += (int)((unsigned char)pBuffer[i*2+1]);
    }
  }

  while((sum & 0xffff0000) != 0) {
    sum = (sum & 0xffff) + ((sum >> 16) & 0xffff);
  }
  unsigned short int ssum = (~sum) & 0xffff;
  if(ssum != header_checksum) {
    ip_DiscardPkt(pBuffer,STUD_IP_TEST_CHECKSUM_ERROR);
    return 1;
  }
  ip_SendtoUp(pBuffer,length);
  return 0;
}

int stud_ip_Upsend(char *pBuffer,unsigned short len,unsigned int srcAddr,
           unsigned int dstAddr,byte protocol,byte ttl)
{
  char *pack_to_sent = new char[len+20];
  memset(pack_to_sent,0,len+20);
  *((Ipv4*)pack_to_sent) = Ipv4(len,srcAddr,dstAddr,protocol,ttl);
  memcpy(pack_to_sent+20,pBuffer,len);
  ip_SendtoLower(pack_to_sent,len+20);
  delete[] pack_to_sent;
  
  return 0;
}
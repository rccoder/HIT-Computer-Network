/* 
* THIS FILE IS FOR IP FORWARD TEST 
*/ 
#include "sysInclude.h" 
#include 
using std::vector; 
#include 
using std::cout; 
// system support 
extern void fwd_LocalRcv(char *pBuffer, int length); 

extern void fwd_SendtoLower(char *pBuffer, int length, unsigned int nexthop); 

extern void fwd_DiscardPkt(char *pBuffer, int type); 

extern unsigned int getIpv4Address( ); 

// implemented by students 

struct routeTable 
{ 
unsigned int destIP; 
unsigned int mask; 
unsigned int masklen; 
unsigned int nexthop; 
}; 
vector m_table; 

void stud_Route_Init() 
{ 
m_table.clear(); 
return; 
} 

void stud_route_add(stud_route_msg *proute) 
{ 
routeTable newTableItem; 
newTableItem.masklen = ntohl(proute->masklen); 
newTableItem.mask = (1<<31)>>(ntohl(proute->masklen)-1); 
newTableItem.destIP = ntohl(proute->dest)&newTableItem.mask; 
newTableItem.nexthop = ntohl(proute->nexthop); 
m_table.push_back(newTableItem); 
return; 
} 

int stud_fwd_deal(char *pBuffer, int length) 
{ 

int IHL = pBuffer[0] & 0xf; 

int TTL = (int)pBuffer[8]; 
int headerChecksum = ntohl(*(unsigned short*)(pBuffer+10)); 
int destIP = ntohl(*(unsigned int*)(pBuffer+16)); 


if(destIP == getIpv4Address()) 
{ 
fwd_LocalRcv(pBuffer, length); 
return 0; 
} 



if(TTL <= 0) 
{ 
fwd_DiscardPkt(pBuffer, STUD_FORWARD_TEST_TTLERROR); 
return 1; 
}	




bool isMatch = false; 
unsigned int longestMatchLen = 0; 
int bestMatch = 0; 

for(int i = 0; i < m_table.size(); i ++) 
{ 
if(m_table[i].masklen > longestMatchLen && m_table[i].destIP == (destIP & m_table[i].mask)) 
{ 
bestMatch = i; 
isMatch = true; 
longestMatchLen = m_table[i].masklen; 
//cout << "find one" << endl; 
} 
} 

if(isMatch) 
{ 
char *buffer = new char[length]; 
memcpy(buffer,pBuffer,length); 
buffer[8]--; //TTL - 1 
int sum = 0; 
unsigned short int localCheckSum = 0; 
for(int j = 0; j < 2 * IHL; j ++) 
{ 
if (j != 5) { 
sum = sum + (buffer[j*2]<<8) + (buffer[j*2+1]); 
} 

} 

while((unsigned(sum) >> 16) != 0) 
sum = unsigned(sum) >> 16 + sum & 0xffff; 

localCheckSum = htons(0xffff - (unsigned short int)sum); 
memcpy(buffer+10, &localCheckSum, sizeof(unsigned short)); 

fwd_SendtoLower(buffer, length, m_table[bestMatch].nexthop); 
return 0; 
} 
else 
{ 
fwd_DiscardPkt(pBuffer, STUD_FORWARD_TEST_NOROUTE); 
return 1; 
} 
return 1; 
} 
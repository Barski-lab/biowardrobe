//#include <boost/icl/interval.hpp>
//#include <boost/icl/closed_interval.hpp>
#include <boost/icl/interval_map.hpp>
//#include <boost/icl/separate_interval_set.hpp>
//#include <boost/icl/concept/interval_associator.hpp>


namespace bicl = boost::icl;

using namespace std;


int main(void)
{


bicl::interval_map<int,int> a,b,c; 
a+=make_pair(bicl::discrete_interval<int>::closed((int)1,(int)3),1);

//bicl::interval_map<int,int> b; 

b+=make_pair(bicl::discrete_interval<int>::closed((int)2,(int)4),1);
b+=make_pair(bicl::discrete_interval<int>::closed((int)6,(int)7),1);

//bicl::interval_map<int,int> c;

bicl::interval_set<int> d;

//bicl::interval_set<int,int> e;



//            a+=make_pair(bicl::discrete_interval<int>::closed(left,right),1);

    bicl::interval_map<int, int>::iterator it = b.begin();
    cout << "----- History of party guests -------------------------\n";
    while(it != b.end())
    {
      bicl::discrete_interval<int> itv  = it->first;
        // Who is at the party within the time interval 'when' ?
        int who = (*it++).second;
        cout << itv << ": " << who << endl;
    }

a+=make_pair(bicl::discrete_interval<int>::closed((int)2,(int)4),1);

b+=make_pair(bicl::discrete_interval<int>::closed((int)1,(int)3),1);;

cout<<"a:"<<a<<endl;
cout<<"b:"<<b<<endl;

c=a&b;


    it = c.begin();
    cout << "----- cccccccccccccccccccc -------------------------\n";
    while(it != c.end())
    {
      bicl::discrete_interval<int> itv  = it->first;
        // Who is at the party within the time interval 'when' ?
        int who = (*it++).second;
        cout << itv << ": " << who << endl;
    }


if(a==b)
{
        cout << "equal" << endl;
}
else
{
        cout << "Nequal" << endl;
}

//c=d;

return 0; 
}
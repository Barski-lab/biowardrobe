/****************************************************************************
**
** Copyright (C) 2011 Andrey Kartashov .
** All rights reserved.
** Contact: Andrey Kartashov (porter@porter.st)
**
** This file is part of the global module of the genome-tools.
**
** GNU Lesser General Public License Usage
** This file may be used under the terms of the GNU Lesser General Public
** License version 2.1 as published by the Free Software Foundation and
** appearing in the file LICENSE.LGPL included in the packaging of this
** file. Please review the following information to ensure the GNU Lesser
** General Public License version 2.1 requirements will be met:
** http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html.
**
** Other Usage
** Alternatively, this file may be used in accordance with the terms and
** conditions contained in a signed written agreement between you and Andrey Kartashov.
**
****************************************************************************/
#ifndef _MATH_H_28112012_
#define _MATH_H_28112012_

#include <limits>
//std::numeric_limits<float>::max();
//std::numeric_limits<float>::min();
//std::numeric_limits<float>::infinity();


namespace Math{

typedef long double ldouble;

template<typename T>
inline T mlog(T& v)
{   return log(v); }

template<>
inline float mlog<float>(float& v)
{   return logf(v); }

template<>
inline long double mlog<long double>(long double& v)
{   return logl(v); }

template<typename T>
inline T mexp(T& v)
{   return exp(v); }

template<>
inline float mexp<float>(float& v)
{   return expf(v); }

template<>
inline long double mexp<long double>(long double& v)
{   return expl(v); }


template<typename T>
inline T mpow(T& x,T& y)
{   return pow(x,y); }

template<>
inline float mpow<float>(float& x, float& y)
{   return powf(x,y); }

template<>
inline long double mpow<long double>(long double& x,long double& y)
{   return powl(x,y); }

template <typename T>
T Poisson_cdist(int k, T lambda) {
    T res = 1.0;
    for(int i=0; i<k+1 && res>0; i++) {
        T log_cur_p = -lambda + i*mlog<T>(lambda) ;
        for(T j=1; j<=i; j+=1)//factorial
            log_cur_p -= mlog<T>(j);
        res -= mexp<T>(log_cur_p);
    }
    if(res<0) res=0.0;
    return res;
}

template<typename T>
static QVector<T> smooth(const QVector<T>&,const int &);

template<typename T>
static T mean(const QVector<T>&,const int&,const int&);

/*
 * calculating mean between end and begin in a QVector of type T
 */
template<typename T>
T mean(const QVector<T>& list,const int& begin,const int& end)
{
    assert(end<list.size());
    assert((end-begin)>0);
    T tmp=0;
    for(int i=begin;i<=end;i++)
        tmp+=list.at(i);

    return (tmp/(end-begin+1));
}

/*
 * Smooth data in a QVector with span
 */
template<typename T>
QVector<T> smooth(const QVector<T>& list,const int& span)
{
    QVector<T> result;
    int win=span;
    if(win<3 || list.size()<win) return list;
    if(win%2!=1) --win;
    int half_w=win/2;
    int size=list.size();
    int mid=size-half_w;
    int x;
    int start=0,end=0;
    result<<list.first();
    try{
        for(x=1;x<size-1;x++)
        {
            if(x>=half_w && x<mid) //middle
            {
                start=x-half_w;
                end=x+half_w;
            }
            else if(x<half_w) //beginning
            {
                start=0;
                end=x+x;
            }
            else if(x>=mid) //end
            {
                start=x - (size-x);
                end=size-1;
            }
            result<<mean<T>(list,start,end);
        }
        result<<list.last();
    }
    catch(...)
    {
        qDebug()<<"List.size:"<<list.size()<<" result.size:"<<result.size()<<" x="<<x;
    }

    return result;
}



}//namespace

#include <Matrix.hpp>

#endif

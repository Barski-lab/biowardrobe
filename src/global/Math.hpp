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



}//namespace

#include <Matrix.hpp>

#endif

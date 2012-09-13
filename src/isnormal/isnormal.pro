######################################################################
# pro file for complexity plot Wed Oct 19 14:59:16 2011
######################################################################

TEMPLATE = app
TARGET   = IsNormal

CONFIG   += console warn_on release
QT       -= gui
QT       += sql


OBJECTS_DIR = build
UI_DIR      = build
MOC_DIR     = build
RCC_DIR     = build

DEFINES     += _APPNAME=\\\"$$TARGET\\\" \
               D_USE_SAM

HEADERS     +=  isnormal.hpp \
               ../global/SamReader.hpp 

#../global/SqlReader.hpp \
#               ../global/SamReader.hpp \
#               ../global/AVDHandler.hpp \
#               ../global/FileWriter.hpp \
#               ../global/PostHandler.hpp \
#              ../global/MGLWriter.hpp \
               
               
SOURCES     += main.cpp \
               isnormal.cpp \
               ../global/Reads.cpp

#../global/SqlReader.cpp \
#               ../global/SamReader.cpp \
#               ../global/AVDHandler.cpp \
#               ../global/FileWriter.cpp \
#               ../global/PostHandler.cpp \
#               ../global/MGLwriter.cpp \

INCLUDEPATH += . \
               ../global \
               ../../thirdparty/boost \
               ../../thirdparty/samtools-0.1.18 
#               ../../thirdparty/mathgl-1.11.2/include

DEPENDPATH  += .


LIBS        += ../../thirdparty/samtools-0.1.18/libbam.a \
               -lgsl -lpng -lgslcblas -lm -lz

#               ../../thirdparty/boost \
#               ../../thirdparty/mathgl-1.11.2/mgl/.libs/libmgl.a \

QMAKE_CXXFLAGS += -Werror

#lib_samtools.commands = cd ../../thirdparty/samtools-0.1.18/; $(MAKE) -j 8

#QMAKE_EXTRA_TARGETS = lib_samtools
#PRE_TARGETDEPS      = lib_samtools

QMAKE_CLEAN += $$TARGET logfile.log *~ *.txt ../global/*~

